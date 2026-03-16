/**
 * MustardTree Document Portal - Cloudflare Worker API
 *
 * Handles all document operations server-side with proper authentication,
 * authorization, and R2 storage integration.
 */

export interface Env {
  DB: D1Database;
  DOCUMENTS_BUCKET: R2Bucket;
  ENVIRONMENT: string;
  ALLOWED_ORIGINS: string;
  CF_ACCESS_DOMAIN: string;
  CF_ACCESS_AUD: string;
  MAX_FILE_SIZE: string;
  ALLOWED_FILE_TYPES: string;
  PRESIGNED_URL_EXPIRY: string;
}

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  groups: string[];
  role: 'admin' | 'staff' | 'customer' | null;
  customerId: string | null;
}

// ----- CORS -----

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowed = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());

  if (allowed.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Jwt-Assertion',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    };
  }

  return {};
}

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

// ----- JWT / AUTH -----

let publicKeysCache: { keys: Record<string, JsonWebKey>; fetchedAt: number } | null = null;
const KEY_CACHE_MS = 3600_000;

async function fetchPublicKeys(domain: string): Promise<Record<string, JsonWebKey>> {
  const now = Date.now();
  if (publicKeysCache && now - publicKeysCache.fetchedAt < KEY_CACHE_MS) {
    return publicKeysCache.keys;
  }

  const resp = await fetch(`https://${domain}/cdn-cgi/access/certs`);
  if (!resp.ok) throw new Error(`Failed to fetch certs: ${resp.status}`);

  const certs: { keys: Array<JsonWebKey & { kid: string }> } = await resp.json();
  const keysMap: Record<string, JsonWebKey> = {};
  for (const key of certs.keys) {
    if (key.kid) keysMap[key.kid] = key;
  }

  publicKeysCache = { keys: keysMap, fetchedAt: now };
  return keysMap;
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

async function verifyJwt(token: string, env: Env): Promise<AuthUser | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const headerJson = new TextDecoder().decode(base64UrlDecode(parts[0]));
    const header = JSON.parse(headerJson);
    const kid: string = header.kid;
    if (!kid) return null;

    // Fetch and verify with public key
    const keys = await fetchPublicKeys(env.CF_ACCESS_DOMAIN);
    const jwk = keys[kid];
    if (!jwk) return null;

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signedData = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = base64UrlDecode(parts[2]);

    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, signedData);
    if (!valid) return null;

    // Decode payload
    const payloadJson = new TextDecoder().decode(base64UrlDecode(parts[1]));
    const payload = JSON.parse(payloadJson);

    // Verify audience
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(env.CF_ACCESS_AUD)) return null;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    // Determine role
    const groups: string[] = payload.groups || [];
    const customRole = payload.custom?.role;

    let role: AuthUser['role'] = null;
    if (['admin', 'administrator', 'blog-admin'].some(g => groups.includes(g)) || customRole === 'admin') {
      role = 'admin';
    } else if (['staff', 'employee'].some(g => groups.includes(g)) || customRole === 'staff') {
      role = 'staff';
    } else if (['customer', 'client'].some(g => groups.includes(g)) || customRole === 'customer') {
      role = 'customer';
    }

    const customerId = payload.custom?.customerId || (role === 'customer' ? (payload.sub || payload.email) : null);

    return {
      id: payload.sub || payload.email,
      email: payload.email,
      name: payload.name,
      groups,
      role,
      customerId,
    };
  } catch {
    return null;
  }
}

async function authenticate(request: Request, env: Env): Promise<AuthUser | null> {
  // Try CF-Access-Jwt-Assertion header first (set by Cloudflare Access)
  const headerJwt = request.headers.get('CF-Access-Jwt-Assertion');
  if (headerJwt) {
    return verifyJwt(headerJwt, env);
  }

  // Try Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return verifyJwt(authHeader.slice(7), env);
  }

  // Try CF_Authorization cookie
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/CF_Authorization=([^;]+)/);
  if (match) {
    return verifyJwt(decodeURIComponent(match[1]), env);
  }

  return null;
}

function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin';
}

function isStaff(user: AuthUser): boolean {
  return user.role === 'admin' || user.role === 'staff';
}

// ----- INPUT VALIDATION -----

function sanitize(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .trim();
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Validate file MIME type by checking magic bytes
const MAGIC_BYTES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]], // GIF8
  'image/webp': [], // RIFF....WEBP - checked separately
};

async function validateFileContent(file: ArrayBuffer, declaredType: string): Promise<boolean> {
  const bytes = new Uint8Array(file.slice(0, 12));

  // Check WebP (RIFF....WEBP)
  if (declaredType === 'image/webp') {
    return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
           bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  }

  // Check Office Open XML formats (ZIP-based: .docx, .xlsx, .pptx)
  const officeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  if (officeTypes.includes(declaredType)) {
    return bytes[0] === 0x50 && bytes[1] === 0x4B; // PK (ZIP header)
  }

  // Text types - allow anything
  if (declaredType === 'text/plain' || declaredType === 'text/csv') {
    return true;
  }

  // Check known magic bytes
  const patterns = MAGIC_BYTES[declaredType];
  if (patterns && patterns.length > 0) {
    return patterns.some(pattern =>
      pattern.every((byte, i) => bytes[i] === byte)
    );
  }

  return false;
}

// ----- AUDIT LOGGING -----

async function logAccess(
  db: D1Database,
  documentId: string,
  user: AuthUser,
  action: string,
  request: Request,
  details?: string
): Promise<void> {
  try {
    await db.prepare(
      `INSERT INTO access_log (document_id, user_id, user_email, action, ip_address, user_agent, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      documentId,
      user.id,
      user.email,
      action,
      request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown',
      request.headers.get('User-Agent') || 'unknown',
      details || null
    ).run();
  } catch (e) {
    console.error('Failed to log access:', e);
  }
}

// ----- PERMISSION CHECKS -----

async function canAccessDocument(
  db: D1Database,
  documentId: string,
  user: AuthUser,
  requiredPermission: 'view' | 'download' | 'upload'
): Promise<boolean> {
  if (isAdmin(user) || isStaff(user)) return true;

  // Check if user's customerId matches the document's customerId
  const doc = await db.prepare('SELECT customer_id FROM documents WHERE id = ?').bind(documentId).first<{ customer_id: string }>();
  if (!doc) return false;

  if (user.customerId && doc.customer_id === user.customerId) {
    // Customer owns this document - check their access level
    const customer = await db.prepare('SELECT access_level FROM customers WHERE id = ? AND is_active = 1').bind(user.customerId).first<{ access_level: string }>();
    if (!customer) return false;

    if (requiredPermission === 'upload' && customer.access_level === 'read-only') return false;
    return true;
  }

  // Check explicit permissions
  const perm = await db.prepare(
    'SELECT id FROM document_permissions WHERE document_id = ? AND principal_id = ? AND permission = ?'
  ).bind(documentId, user.id, requiredPermission).first();

  return !!perm;
}

async function canAccessCustomerDocuments(user: AuthUser, customerId: string): Promise<boolean> {
  if (isAdmin(user) || isStaff(user)) return true;
  return user.customerId === customerId;
}

// ----- ROUTE HANDLERS -----

// GET /api/documents?customerId=&folderId=&search=&page=&limit=
async function handleGetDocuments(request: Request, env: Env, user: AuthUser): Promise<Response> {
  const url = new URL(request.url);
  const customerId = url.searchParams.get('customerId');
  const folderId = url.searchParams.get('folderId');
  const search = url.searchParams.get('search');
  const confidentialOnly = url.searchParams.get('confidentialOnly') === 'true';
  const fileTypes = url.searchParams.get('fileTypes');
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25')));
  const offset = (page - 1) * limit;

  // Customers can only see their own documents
  let effectiveCustomerId = customerId;
  if (user.role === 'customer') {
    effectiveCustomerId = user.customerId;
    if (!effectiveCustomerId) {
      return jsonResponse({ error: 'Customer ID not found' }, 403);
    }
  }

  let query = `SELECT d.*, GROUP_CONCAT(DISTINCT dv.id || '|' || dv.version || '|' || dv.file_name || '|' || dv.file_size || '|' || dv.mime_type || '|' || dv.uploaded_by || '|' || dv.uploaded_at || '|' || dv.r2_key || '|' || dv.checksum || '|' || COALESCE(dv.change_note, '')) as version_data FROM documents d LEFT JOIN document_versions dv ON d.id = dv.document_id WHERE 1=1`;
  const params: (string | number)[] = [];

  if (effectiveCustomerId) {
    query += ' AND d.customer_id = ?';
    params.push(effectiveCustomerId);
  }
  if (folderId) {
    query += ' AND d.folder_id = ?';
    params.push(folderId);
  }
  if (search) {
    query += ' AND (d.name LIKE ? OR d.description LIKE ? OR d.tags LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }
  if (confidentialOnly) {
    query += ' AND d.is_confidential = 1';
  }
  if (fileTypes) {
    const types = fileTypes.split(',').map(t => t.trim());
    const typeClauses = types.map(() => 'dv.mime_type LIKE ?');
    query += ` AND (${typeClauses.join(' OR ')})`;
    types.forEach(t => params.push(`%${t}%`));
  }

  query += ' GROUP BY d.id ORDER BY d.updated_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const stmt = env.DB.prepare(query);
  const results = await stmt.bind(...params).all();

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) as total FROM documents WHERE 1=1';
  const countParams: (string | number)[] = [];
  if (effectiveCustomerId) {
    countQuery += ' AND customer_id = ?';
    countParams.push(effectiveCustomerId);
  }
  if (folderId) {
    countQuery += ' AND folder_id = ?';
    countParams.push(folderId);
  }
  if (search) {
    countQuery += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
    const s = `%${search}%`;
    countParams.push(s, s, s);
  }
  if (confidentialOnly) {
    countQuery += ' AND is_confidential = 1';
  }
  if (fileTypes) {
    const types = fileTypes.split(',').map(t => t.trim());
    countQuery += ` AND id IN (SELECT document_id FROM document_versions WHERE ${types.map(() => 'mime_type LIKE ?').join(' OR ')})`;
    types.forEach(t => countParams.push(`%${t}%`));
  }

  const countResult = await env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>();

  // Parse version data into structured format
  const documents = (results.results || []).map((row: Record<string, unknown>) => {
    const versionData = row.version_data as string | null;
    const versions = versionData
      ? versionData.split(',').map((v: string) => {
          const [id, version, fileName, fileSize, mimeType, uploadedBy, uploadedAt, r2Key, checksum, changeNote] = v.split('|');
          return {
            id, version: parseInt(version), fileName, fileSize: parseInt(fileSize),
            mimeType, uploadedBy, uploadedAt, r2Key, checksum,
            changeNote: changeNote || undefined,
          };
        }).sort((a: { version: number }, b: { version: number }) => a.version - b.version)
      : [];

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      customerId: row.customer_id,
      folderId: row.folder_id,
      currentVersion: row.current_version,
      isConfidential: !!(row.is_confidential),
      tags: row.tags ? JSON.parse(row.tags as string) : [],
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastAccessedAt: row.last_accessed_at,
      versions,
    };
  });

  return jsonResponse({
    documents,
    pagination: {
      page,
      limit,
      total: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / limit),
    },
  });
}

// POST /api/documents/upload
async function handleUploadDocument(request: Request, env: Env, user: AuthUser): Promise<Response> {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const customerId = formData.get('customerId') as string | null;
  const folderId = formData.get('folderId') as string | null;
  const description = formData.get('description') as string | null;
  const tags = formData.get('tags') as string | null;
  const isConfidential = formData.get('isConfidential') === 'true';
  const changeNote = formData.get('changeNote') as string | null;

  if (!file) return jsonResponse({ error: 'No file provided' }, 400);
  if (!customerId) return jsonResponse({ error: 'Customer ID required' }, 400);

  // Authorization
  if (!(await canAccessCustomerDocuments(user, customerId))) {
    return jsonResponse({ error: 'Access denied' }, 403);
  }

  // Validate file size
  const maxSize = parseInt(env.MAX_FILE_SIZE || '104857600');
  if (file.size > maxSize) {
    return jsonResponse({ error: `File exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB` }, 400);
  }

  // Validate file type
  const allowedTypes = env.ALLOWED_FILE_TYPES.split(',').map(t => t.trim());
  if (!allowedTypes.includes(file.type)) {
    return jsonResponse({ error: `File type '${file.type}' is not allowed` }, 400);
  }

  // Validate magic bytes
  const fileBuffer = await file.arrayBuffer();
  const magicValid = await validateFileContent(fileBuffer, file.type);
  if (!magicValid) {
    return jsonResponse({ error: 'File content does not match declared type' }, 400);
  }

  // Calculate checksum
  const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
  const checksum = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  // Check for existing document with same name in same folder
  const existing = await env.DB.prepare(
    'SELECT id, current_version FROM documents WHERE customer_id = ? AND LOWER(name) = LOWER(?) AND (folder_id = ? OR (folder_id IS NULL AND ? IS NULL))'
  ).bind(customerId, file.name, folderId, folderId).first<{ id: string; current_version: number }>();

  const now = new Date().toISOString();
  let documentId: string;
  let versionNum: number;

  if (existing) {
    // Add new version to existing document
    documentId = existing.id;
    versionNum = existing.current_version + 1;

    await env.DB.prepare('UPDATE documents SET current_version = ?, updated_at = ? WHERE id = ?')
      .bind(versionNum, now, documentId).run();
  } else {
    // Create new document
    documentId = generateId('doc');
    versionNum = 0;

    const sanitizedName = sanitize(file.name);
    const sanitizedDesc = description ? sanitize(description) : null;
    const tagsJson = tags ? JSON.stringify(tags.split(',').map(t => sanitize(t.trim()))) : null;

    await env.DB.prepare(
      `INSERT INTO documents (id, name, description, customer_id, folder_id, current_version, is_confidential, tags, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(documentId, sanitizedName, sanitizedDesc, customerId, folderId, 0, isConfidential ? 1 : 0, tagsJson, user.id, now, now).run();

    // Grant default permissions to the customer
    await env.DB.batch([
      env.DB.prepare('INSERT INTO document_permissions (document_id, principal_id, permission, granted_by) VALUES (?, ?, ?, ?)')
        .bind(documentId, customerId, 'view', user.id),
      env.DB.prepare('INSERT INTO document_permissions (document_id, principal_id, permission, granted_by) VALUES (?, ?, ?, ?)')
        .bind(documentId, customerId, 'download', user.id),
      env.DB.prepare('INSERT INTO document_permissions (document_id, principal_id, permission, granted_by) VALUES (?, ?, ?, ?)')
        .bind(documentId, customerId, 'upload', user.id),
    ]);
  }

  // Upload to R2
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const r2Key = `customers/${customerId}/documents/${documentId}/v${versionNum}/${sanitizedFileName}`;

  await env.DOCUMENTS_BUCKET.put(r2Key, fileBuffer, {
    httpMetadata: { contentType: file.type },
    customMetadata: {
      documentId,
      version: String(versionNum),
      uploadedBy: user.id,
      checksum,
    },
  });

  // Create version record
  const versionId = generateId('ver');
  await env.DB.prepare(
    `INSERT INTO document_versions (id, document_id, version, file_name, file_size, mime_type, uploaded_by, uploaded_at, r2_key, checksum, change_note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(versionId, documentId, versionNum, file.name, file.size, file.type, user.id, now, r2Key, checksum, changeNote ? sanitize(changeNote) : null).run();

  await logAccess(env.DB, documentId, user, 'upload', request, `Version ${versionNum}`);

  // Fetch and return the full document
  const doc = await env.DB.prepare('SELECT * FROM documents WHERE id = ?').bind(documentId).first();
  const versions = await env.DB.prepare('SELECT * FROM document_versions WHERE document_id = ? ORDER BY version').bind(documentId).all();

  return jsonResponse({
    id: doc!.id,
    name: doc!.name,
    description: doc!.description,
    customerId: doc!.customer_id,
    folderId: doc!.folder_id,
    currentVersion: doc!.current_version,
    isConfidential: !!(doc!.is_confidential),
    tags: doc!.tags ? JSON.parse(doc!.tags as string) : [],
    createdBy: doc!.created_by,
    createdAt: doc!.created_at,
    updatedAt: doc!.updated_at,
    versions: (versions.results || []).map((v: Record<string, unknown>) => ({
      id: v.id, version: v.version, fileName: v.file_name, fileSize: v.file_size,
      mimeType: v.mime_type, uploadedBy: v.uploaded_by, uploadedAt: v.uploaded_at,
      r2Key: v.r2_key, checksum: v.checksum, changeNote: v.change_note,
    })),
  }, 201);
}

// GET /api/documents/:id/download?version=
async function handleDownloadDocument(request: Request, env: Env, user: AuthUser, documentId: string): Promise<Response> {
  const url = new URL(request.url);
  const versionParam = url.searchParams.get('version');

  // Check permission
  if (!(await canAccessDocument(env.DB, documentId, user, 'download'))) {
    return jsonResponse({ error: 'Access denied' }, 403);
  }

  // Get document
  const doc = await env.DB.prepare('SELECT * FROM documents WHERE id = ?').bind(documentId).first();
  if (!doc) return jsonResponse({ error: 'Document not found' }, 404);

  // Get the right version
  const versionNum = versionParam ? parseInt(versionParam) : doc.current_version as number;
  const version = await env.DB.prepare(
    'SELECT * FROM document_versions WHERE document_id = ? AND version = ?'
  ).bind(documentId, versionNum).first();
  if (!version) return jsonResponse({ error: 'Version not found' }, 404);

  // Get file from R2
  const object = await env.DOCUMENTS_BUCKET.get(version.r2_key as string);
  if (!object) return jsonResponse({ error: 'File not found in storage' }, 404);

  // Log access
  await logAccess(env.DB, documentId, user, 'download', request, `Version ${versionNum}`);

  // Update last accessed time
  await env.DB.prepare('UPDATE documents SET last_accessed_at = ? WHERE id = ?')
    .bind(new Date().toISOString(), documentId).run();

  // Return file directly
  return new Response(object.body, {
    headers: {
      'Content-Type': (version.mime_type as string) || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(version.file_name as string)}"`,
      'Content-Length': String(version.file_size),
      'X-Checksum-SHA256': version.checksum as string,
    },
  });
}

// DELETE /api/documents/:id?version=
async function handleDeleteDocument(request: Request, env: Env, user: AuthUser, documentId: string): Promise<Response> {
  if (!isAdmin(user)) {
    return jsonResponse({ error: 'Only administrators can delete documents' }, 403);
  }

  const url = new URL(request.url);
  const versionParam = url.searchParams.get('version');

  const doc = await env.DB.prepare('SELECT * FROM documents WHERE id = ?').bind(documentId).first();
  if (!doc) return jsonResponse({ error: 'Document not found' }, 404);

  if (versionParam) {
    // Delete specific version
    const versionNum = parseInt(versionParam);
    const versionCount = await env.DB.prepare('SELECT COUNT(*) as count FROM document_versions WHERE document_id = ?').bind(documentId).first<{ count: number }>();
    if ((versionCount?.count || 0) <= 1) {
      return jsonResponse({ error: 'Cannot delete the only version. Delete the entire document instead.' }, 400);
    }

    const version = await env.DB.prepare('SELECT * FROM document_versions WHERE document_id = ? AND version = ?').bind(documentId, versionNum).first();
    if (!version) return jsonResponse({ error: 'Version not found' }, 404);

    // Delete from R2
    await env.DOCUMENTS_BUCKET.delete(version.r2_key as string);

    // Delete from D1
    await env.DB.prepare('DELETE FROM document_versions WHERE document_id = ? AND version = ?').bind(documentId, versionNum).run();

    // Update current version if needed
    if ((doc.current_version as number) >= versionNum) {
      const latest = await env.DB.prepare('SELECT MAX(version) as max_v FROM document_versions WHERE document_id = ?').bind(documentId).first<{ max_v: number }>();
      await env.DB.prepare('UPDATE documents SET current_version = ?, updated_at = ? WHERE id = ?')
        .bind(latest?.max_v || 0, new Date().toISOString(), documentId).run();
    }

    await logAccess(env.DB, documentId, user, 'delete', request, `Version ${versionNum}`);
    return jsonResponse({ success: true, message: `Version ${versionNum} deleted` });
  }

  // Delete entire document
  const versions = await env.DB.prepare('SELECT r2_key FROM document_versions WHERE document_id = ?').bind(documentId).all();
  for (const v of versions.results || []) {
    await env.DOCUMENTS_BUCKET.delete(v.r2_key as string);
  }

  await logAccess(env.DB, documentId, user, 'delete', request, 'Entire document');

  // D1 cascading deletes handle versions, permissions
  await env.DB.prepare('DELETE FROM documents WHERE id = ?').bind(documentId).run();

  return jsonResponse({ success: true, message: 'Document deleted' });
}

// GET /api/folders?customerId=
async function handleGetFolders(request: Request, env: Env, user: AuthUser): Promise<Response> {
  const url = new URL(request.url);
  let customerId = url.searchParams.get('customerId');

  if (user.role === 'customer') {
    customerId = user.customerId;
  }

  let query = 'SELECT * FROM folders WHERE 1=1';
  const params: string[] = [];
  if (customerId) {
    query += ' AND customer_id = ?';
    params.push(customerId);
  }
  query += ' ORDER BY name';

  const results = await env.DB.prepare(query).bind(...params).all();

  const folders = (results.results || []).map((row: Record<string, unknown>) => ({
    id: row.id,
    name: row.name,
    customerId: row.customer_id,
    parentFolderId: row.parent_folder_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return jsonResponse({ folders });
}

// POST /api/folders
async function handleCreateFolder(request: Request, env: Env, user: AuthUser): Promise<Response> {
  const body = await request.json<{ name: string; customerId: string; parentFolderId?: string }>();
  if (!body.name || !body.customerId) return jsonResponse({ error: 'Name and customerId required' }, 400);

  if (!(await canAccessCustomerDocuments(user, body.customerId))) {
    return jsonResponse({ error: 'Access denied' }, 403);
  }

  const folderId = generateId('folder');
  const now = new Date().toISOString();

  await env.DB.prepare(
    'INSERT INTO folders (id, name, customer_id, parent_folder_id, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(folderId, sanitize(body.name), body.customerId, body.parentFolderId || null, user.id, now, now).run();

  return jsonResponse({
    id: folderId,
    name: body.name,
    customerId: body.customerId,
    parentFolderId: body.parentFolderId || null,
    createdBy: user.id,
    createdAt: now,
    updatedAt: now,
  }, 201);
}

// GET /api/customers
async function handleGetCustomers(request: Request, env: Env, user: AuthUser): Promise<Response> {
  if (!isStaff(user)) return jsonResponse({ error: 'Access denied' }, 403);

  const results = await env.DB.prepare('SELECT * FROM customers WHERE is_active = 1 ORDER BY name').all();

  const customers = (results.results || []).map((row: Record<string, unknown>) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    accessLevel: row.access_level,
    isActive: !!(row.is_active),
    createdAt: row.created_at,
    lastLogin: row.last_login,
  }));

  return jsonResponse({ customers });
}

// POST /api/customers
async function handleCreateCustomer(request: Request, env: Env, user: AuthUser): Promise<Response> {
  if (!isStaff(user)) return jsonResponse({ error: 'Access denied' }, 403);

  const body = await request.json<{ name: string; email: string; company?: string; accessLevel?: string }>();
  if (!body.name || !body.email) return jsonResponse({ error: 'Name and email required' }, 400);

  const customerId = generateId('customer');
  const now = new Date().toISOString();

  await env.DB.prepare(
    'INSERT INTO customers (id, name, email, company, access_level, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)'
  ).bind(customerId, sanitize(body.name), sanitize(body.email), body.company ? sanitize(body.company) : null, body.accessLevel || 'read-write', now).run();

  return jsonResponse({
    id: customerId,
    name: body.name,
    email: body.email,
    company: body.company,
    accessLevel: body.accessLevel || 'read-write',
    isActive: true,
    createdAt: now,
  }, 201);
}

// GET /api/audit-log?documentId=&limit=&page=
async function handleGetAuditLog(request: Request, env: Env, user: AuthUser): Promise<Response> {
  if (!isStaff(user)) return jsonResponse({ error: 'Access denied' }, 403);

  const url = new URL(request.url);
  const documentId = url.searchParams.get('documentId');
  const customerId = url.searchParams.get('customerId');
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '100')));
  const offset = (page - 1) * limit;

  let query = 'SELECT al.* FROM access_log al';
  const params: (string | number)[] = [];
  const conditions: string[] = [];

  if (documentId) {
    conditions.push('al.document_id = ?');
    params.push(documentId);
  }
  if (customerId) {
    query += ' JOIN documents d ON al.document_id = d.id';
    conditions.push('d.customer_id = ?');
    params.push(customerId);
  }

  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY al.timestamp DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const results = await env.DB.prepare(query).bind(...params).all();

  const logs = (results.results || []).map((row: Record<string, unknown>) => ({
    documentId: row.document_id,
    userId: row.user_id,
    userEmail: row.user_email,
    action: row.action,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    details: row.details,
    timestamp: row.timestamp,
  }));

  return jsonResponse({ logs });
}

// GET /api/stats?customerId=
async function handleGetStats(request: Request, env: Env, user: AuthUser): Promise<Response> {
  const url = new URL(request.url);
  let customerId = url.searchParams.get('customerId');

  if (user.role === 'customer') {
    customerId = user.customerId;
  }

  const conditions = customerId ? ' WHERE customer_id = ?' : '';
  const params = customerId ? [customerId] : [];

  const [docCount, totalSize, recentActivity, folderCount] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) as count FROM documents${conditions}`).bind(...params).first<{ count: number }>(),
    env.DB.prepare(`SELECT COALESCE(SUM(dv.file_size), 0) as total FROM document_versions dv JOIN documents d ON dv.document_id = d.id${conditions.replace('customer_id', 'd.customer_id')}`).bind(...params).first<{ total: number }>(),
    env.DB.prepare(`SELECT COUNT(*) as count FROM access_log WHERE timestamp > datetime('now', '-7 days')${customerId ? ' AND document_id IN (SELECT id FROM documents WHERE customer_id = ?)' : ''}`).bind(...params).first<{ count: number }>(),
    env.DB.prepare(`SELECT COUNT(*) as count FROM folders${conditions.replace('customer_id', 'customer_id')}`).bind(...params).first<{ count: number }>(),
  ]);

  return jsonResponse({
    totalDocuments: docCount?.count || 0,
    totalStorageBytes: totalSize?.total || 0,
    recentActivityCount: recentActivity?.count || 0,
    totalFolders: folderCount?.count || 0,
  });
}

// DELETE /api/folders/:id
async function handleDeleteFolder(request: Request, env: Env, user: AuthUser, folderId: string): Promise<Response> {
  const folder = await env.DB.prepare('SELECT * FROM folders WHERE id = ?').bind(folderId).first();
  if (!folder) return jsonResponse({ error: 'Folder not found' }, 404);

  if (!(await canAccessCustomerDocuments(user, folder.customer_id as string))) {
    return jsonResponse({ error: 'Access denied' }, 403);
  }

  // Move documents in this folder to no folder
  await env.DB.prepare('UPDATE documents SET folder_id = NULL, updated_at = ? WHERE folder_id = ?')
    .bind(new Date().toISOString(), folderId).run();

  // Move child folders to no parent
  await env.DB.prepare('UPDATE folders SET parent_folder_id = NULL, updated_at = ? WHERE parent_folder_id = ?')
    .bind(new Date().toISOString(), folderId).run();

  await env.DB.prepare('DELETE FROM folders WHERE id = ?').bind(folderId).run();

  return jsonResponse({ success: true });
}

// PUT /api/folders/:id
async function handleUpdateFolder(request: Request, env: Env, user: AuthUser, folderId: string): Promise<Response> {
  const folder = await env.DB.prepare('SELECT * FROM folders WHERE id = ?').bind(folderId).first();
  if (!folder) return jsonResponse({ error: 'Folder not found' }, 404);

  if (!(await canAccessCustomerDocuments(user, folder.customer_id as string))) {
    return jsonResponse({ error: 'Access denied' }, 403);
  }

  const body = await request.json<{ name?: string }>();
  if (!body.name) return jsonResponse({ error: 'Name required' }, 400);

  const now = new Date().toISOString();
  await env.DB.prepare('UPDATE folders SET name = ?, updated_at = ? WHERE id = ?')
    .bind(sanitize(body.name), now, folderId).run();

  return jsonResponse({
    id: folderId,
    name: body.name,
    customerId: folder.customer_id,
    parentFolderId: folder.parent_folder_id,
    createdBy: folder.created_by,
    createdAt: folder.created_at,
    updatedAt: now,
  });
}

// GET /api/documents/:id/activity
async function handleGetDocumentActivity(request: Request, env: Env, user: AuthUser, documentId: string): Promise<Response> {
  // Check permission
  if (!(await canAccessDocument(env.DB, documentId, user, 'view'))) {
    return jsonResponse({ error: 'Access denied' }, 403);
  }

  const url = new URL(request.url);
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));

  const results = await env.DB.prepare(
    'SELECT * FROM access_log WHERE document_id = ? ORDER BY timestamp DESC LIMIT ?'
  ).bind(documentId, limit).all();

  const activity = (results.results || []).map((row: Record<string, unknown>) => ({
    userId: row.user_id,
    userEmail: row.user_email,
    action: row.action,
    details: row.details,
    timestamp: row.timestamp,
  }));

  return jsonResponse({ activity });
}

// GET /api/auth/me
async function handleGetMe(user: AuthUser): Promise<Response> {
  return jsonResponse({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    customerId: user.customerId,
    groups: user.groups,
  });
}

// ----- ROUTER -----

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(request, env);

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Health check (unauthenticated)
    if (path === '/api/health') {
      return jsonResponse({ status: 'ok', environment: env.ENVIRONMENT }, 200, cors);
    }

    // Authenticate
    const user = await authenticate(request, env);
    if (!user) {
      return jsonResponse({ error: 'Authentication required' }, 401, cors);
    }

    try {
      let response: Response;

      // Route matching
      if (path === '/api/auth/me' && request.method === 'GET') {
        response = await handleGetMe(user);
      } else if (path === '/api/documents' && request.method === 'GET') {
        response = await handleGetDocuments(request, env, user);
      } else if (path === '/api/documents/upload' && request.method === 'POST') {
        response = await handleUploadDocument(request, env, user);
      } else if (path.match(/^\/api\/documents\/[^/]+\/download$/) && request.method === 'GET') {
        const docId = path.split('/')[3];
        response = await handleDownloadDocument(request, env, user, docId);
      } else if (path.match(/^\/api\/documents\/[^/]+$/) && request.method === 'DELETE') {
        const docId = path.split('/')[3];
        response = await handleDeleteDocument(request, env, user, docId);
      } else if (path.match(/^\/api\/documents\/[^/]+\/activity$/) && request.method === 'GET') {
        const docId = path.split('/')[3];
        response = await handleGetDocumentActivity(request, env, user, docId);
      } else if (path === '/api/stats' && request.method === 'GET') {
        response = await handleGetStats(request, env, user);
      } else if (path === '/api/folders' && request.method === 'GET') {
        response = await handleGetFolders(request, env, user);
      } else if (path === '/api/folders' && request.method === 'POST') {
        response = await handleCreateFolder(request, env, user);
      } else if (path.match(/^\/api\/folders\/[^/]+$/) && request.method === 'PUT') {
        const fId = path.split('/')[3];
        response = await handleUpdateFolder(request, env, user, fId);
      } else if (path.match(/^\/api\/folders\/[^/]+$/) && request.method === 'DELETE') {
        const fId = path.split('/')[3];
        response = await handleDeleteFolder(request, env, user, fId);
      } else if (path === '/api/customers' && request.method === 'GET') {
        response = await handleGetCustomers(request, env, user);
      } else if (path === '/api/customers' && request.method === 'POST') {
        response = await handleCreateCustomer(request, env, user);
      } else if (path === '/api/audit-log' && request.method === 'GET') {
        response = await handleGetAuditLog(request, env, user);
      } else {
        response = jsonResponse({ error: 'Not found' }, 404);
      }

      // Append CORS headers to response
      const newHeaders = new Headers(response.headers);
      for (const [key, value] of Object.entries(cors)) {
        newHeaders.set(key, value);
      }
      return new Response(response.body, { status: response.status, headers: newHeaders });
    } catch (error) {
      console.error('API error:', error);
      return jsonResponse(
        { error: 'Internal server error' },
        500,
        cors
      );
    }
  },
};
