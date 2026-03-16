/**
 * Client-side file validation for document uploads.
 *
 * This is a first-pass check. The Worker backend performs the authoritative
 * validation including magic-byte verification.
 */

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.docx', '.xlsx', '.pptx', '.txt', '.csv',
]);

export function validateDocumentUpload(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `File exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { isValid: false, error: `File type '${file.type || 'unknown'}' is not allowed` };
  }

  // Check extension
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { isValid: false, error: `File extension '${ext}' is not allowed` };
  }

  // Check for suspicious file names
  const suspiciousPatterns = [/\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.sh$/i, /\.ps1$/i, /\.\./];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return { isValid: false, error: 'File name contains suspicious characters' };
    }
  }

  return { isValid: true };
}
