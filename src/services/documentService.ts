import type { 
  Document, 
  DocumentVersion, 
  DocumentFolder, 
  Customer, 
  DocumentAccess,
  DocumentUploadRequest,
  DocumentDownloadRequest,
  DocumentSearchFilters,
  CloudflareR2Config
} from '../types/documents';
import { sanitizeText } from '../utils/security';

// Storage keys for localStorage (will be replaced with backend API)
const STORAGE_KEYS = {
  DOCUMENTS: 'mustardtree_documents',
  CUSTOMERS: 'mustardtree_customers',
  FOLDERS: 'mustardtree_folders',
  ACCESS_LOG: 'mustardtree_document_access',
  R2_CONFIG: 'mustardtree_r2_config'
};

/**
 * Document Management Service with Cloudflare R2 Integration
 * 
 * This service handles document upload, download, version control, and access management
 * using Cloudflare R2 for storage and Cloudflare Access for authentication.
 */
class DocumentService {
  private r2Config: CloudflareR2Config | null = null;
  private r2ConfigWarningShown: boolean = false;

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize the service with default data and configuration
   */
  private async initializeService(): Promise<void> {
    // Initialize R2 configuration from environment
    this.r2Config = this.getR2ConfigFromEnv();
    
    // Initialize default customers if none exist
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      const defaultCustomers: Customer[] = [
        {
          id: 'customer-1',
          name: 'Acme Corporation',
          email: 'contact@acme.com',
          company: 'Acme Corporation',
          accessLevel: 'read-write',
          createdAt: new Date().toISOString(),
          isActive: true
        }
      ];
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(defaultCustomers));
    }

    // Initialize empty arrays for other data
    if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FOLDERS)) {
      localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACCESS_LOG)) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_LOG, JSON.stringify([]));
    }
  }

  /**
   * Get Cloudflare R2 configuration from environment variables
   */
  private getR2ConfigFromEnv(): CloudflareR2Config | null {
    // Access Vite environment variables
    const accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
    const bucketName = import.meta.env.VITE_R2_BUCKET_NAME || 'mustardtree-documents';
    const accessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      // Only log this once, not on every operation
      if (!this.r2ConfigWarningShown) {
        console.info('📁 Running in demo mode - using mock document storage (R2 credentials not configured)');
        this.r2ConfigWarningShown = true;
      }
      return null;
    }

    return {
      accountId,
      bucketName,
      accessKeyId,
      secretAccessKey,
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`
    };
  }

  /**
   * Generate a secure R2 key for document storage
   */
  private generateR2Key(customerId: string, documentId: string, version: number, fileName: string): string {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `customers/${customerId}/documents/${documentId}/v${version}/${sanitizedFileName}`;
  }

  /**
   * Upload a file to Cloudflare R2
   */
  private async uploadToR2(key: string, file: File): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.r2Config) {
        // Mock mode - simulate successful upload
        console.log(`[MOCK] Would upload ${file.name} to R2 key: ${key}`);
        return { success: true };
      }

      // Create form data for R2 upload
      const formData = new FormData();
      formData.append('file', file);

      // Use Cloudflare R2 REST API
      const uploadUrl = `${this.r2Config.endpoint}/${this.r2Config.bucketName}/${key}`;
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD',
          'Authorization': await this.generateR2AuthHeader('PUT', key, file)
        }
      });

      if (!response.ok) {
        throw new Error(`R2 upload failed: ${response.status} ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('R2 upload error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  }

  /**
   * Generate authorization header for R2 requests (simplified)
   * In production, use proper AWS Signature V4
   */
  private async generateR2AuthHeader(_method: string, _key: string, _file: File): Promise<string> {
    if (!this.r2Config) return '';
    
    // This is a simplified implementation
    // In production, implement proper AWS Signature V4 signing
    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    return `AWS4-HMAC-SHA256 Credential=${this.r2Config.accessKeyId}/${timestamp.slice(0, 8)}/auto/s3/aws4_request, SignedHeaders=host;x-amz-date, Signature=mock-signature`;
  }

  /**
   * Get download URL for a document from R2
   */
  private async getR2DownloadUrl(key: string): Promise<string | null> {
    if (!this.r2Config) {
      // Mock mode - return a mock URL
      return `https://mock-r2-url.com/${key}`;
    }

    try {
      // Generate presigned URL for secure download
      const downloadUrl = `${this.r2Config.endpoint}/${this.r2Config.bucketName}/${key}`;
      
      // In production, generate a proper presigned URL with expiration
      // For now, return the direct URL (not recommended for production)
      return downloadUrl;
    } catch (error) {
      console.error('Failed to generate download URL:', error);
      return null;
    }
  }

  /**
   * Calculate file checksum for integrity verification
   */
  private async calculateChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Log document access for audit purposes
   */
  private logDocumentAccess(access: Omit<DocumentAccess, 'timestamp'>): void {
    const accessLog: DocumentAccess[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESS_LOG) || '[]');
    
    const logEntry: DocumentAccess = {
      ...access,
      timestamp: new Date().toISOString()
    };
    
    accessLog.push(logEntry);
    
    // Keep only last 10000 entries to prevent localStorage bloat
    if (accessLog.length > 10000) {
      accessLog.splice(0, accessLog.length - 10000);
    }
    
    localStorage.setItem(STORAGE_KEYS.ACCESS_LOG, JSON.stringify(accessLog));
  }

  // Customer Management
  async getCustomers(): Promise<Customer[]> {
    const customers: Customer[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
    return customers.filter(c => c.isActive);
  }

  async getCustomerById(customerId: string): Promise<Customer | null> {
    const customers = await this.getCustomers();
    return customers.find(c => c.id === customerId) || null;
  }

  async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const customers = await this.getCustomers();
    
    const newCustomer: Customer = {
      ...customerData,
      id: `customer-${Date.now()}`,
      createdAt: new Date().toISOString(),
      name: sanitizeText(customerData.name),
      email: sanitizeText(customerData.email),
      company: customerData.company ? sanitizeText(customerData.company) : undefined
    };

    customers.push(newCustomer);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    
    return newCustomer;
  }

  // Folder Management
  async getFolders(customerId?: string): Promise<DocumentFolder[]> {
    const folders: DocumentFolder[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLDERS) || '[]');
    return customerId ? folders.filter(f => f.customerId === customerId) : folders;
  }

  async createFolder(folderData: Omit<DocumentFolder, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentFolder> {
    const folders = await this.getFolders();
    
    const newFolder: DocumentFolder = {
      ...folderData,
      id: `folder-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: sanitizeText(folderData.name)
    };

    folders.push(newFolder);
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
    
    return newFolder;
  }

  // Document Management
  async getDocuments(filters?: DocumentSearchFilters): Promise<Document[]> {
    let documents: Document[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]');
    
    if (filters) {
      if (filters.customerId) {
        documents = documents.filter(d => d.customerId === filters.customerId);
      }
      if (filters.folderId) {
        documents = documents.filter(d => d.folderId === filters.folderId);
      }
      if (filters.tags && filters.tags.length > 0) {
        documents = documents.filter(d => 
          d.tags && d.tags.some(tag => filters.tags!.includes(tag))
        );
      }
      if (filters.confidentialOnly) {
        documents = documents.filter(d => d.isConfidential);
      }
      if (filters.fileTypes && filters.fileTypes.length > 0) {
        documents = documents.filter(d => {
          const currentVersion = d.versions[d.currentVersion];
          return currentVersion && filters.fileTypes!.some(type => 
            currentVersion.mimeType.includes(type)
          );
        });
      }
    }
    
    return documents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getDocumentById(documentId: string): Promise<Document | null> {
    const documents = await this.getDocuments();
    return documents.find(d => d.id === documentId) || null;
  }

  async uploadDocument(uploadRequest: DocumentUploadRequest, userId: string): Promise<Document> {
    const { file, customerId, folderId, description, tags, isConfidential = false, changeNote } = uploadRequest;
    
    // Validate file
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new Error('File size exceeds 100MB limit');
    }

    // Check for existing document with same name
    const existingDocuments = await this.getDocuments({ customerId });
    const existingDoc = existingDocuments.find(d => 
      d.name.toLowerCase() === file.name.toLowerCase() && 
      d.folderId === folderId
    );

    if (existingDoc) {
      // Add new version to existing document
      return await this.addDocumentVersion(existingDoc.id, file, userId, changeNote);
    }

    // Create new document
    const documentId = `doc-${Date.now()}`;
    const checksum = await this.calculateChecksum(file);
    const r2Key = this.generateR2Key(customerId, documentId, 1, file.name);

    // Upload to R2
    const uploadResult = await this.uploadToR2(r2Key, file);
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // Create document version
    const version: DocumentVersion = {
      id: `version-${Date.now()}`,
      version: 1,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      r2Key,
      checksum,
      changeNote
    };

    // Create document
    const newDocument: Document = {
      id: documentId,
      name: sanitizeText(file.name),
      description: description ? sanitizeText(description) : undefined,
      customerId,
      folderId,
      currentVersion: 0, // 0-based index
      versions: [version],
      tags: tags?.map(tag => sanitizeText(tag)),
      isConfidential,
      accessPermissions: {
        canView: [customerId],
        canDownload: [customerId],
        canUpload: [customerId]
      },
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to storage
    const documents = await this.getDocuments();
    documents.push(newDocument);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));

    // Log access
    this.logDocumentAccess({
      documentId,
      userId,
      action: 'upload'
    });

    return newDocument;
  }

  async addDocumentVersion(documentId: string, file: File, userId: string, changeNote?: string): Promise<Document> {
    const document = await this.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const nextVersion = document.versions.length + 1;
    const checksum = await this.calculateChecksum(file);
    const r2Key = this.generateR2Key(document.customerId, documentId, nextVersion, file.name);

    // Upload to R2
    const uploadResult = await this.uploadToR2(r2Key, file);
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // Create new version
    const version: DocumentVersion = {
      id: `version-${Date.now()}`,
      version: nextVersion,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      r2Key,
      checksum,
      changeNote
    };

    // Update document
    document.versions.push(version);
    document.currentVersion = document.versions.length - 1;
    document.updatedAt = new Date().toISOString();

    // Save to storage
    const documents = await this.getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    documents[index] = document;
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));

    // Log access
    this.logDocumentAccess({
      documentId,
      userId,
      action: 'upload'
    });

    return document;
  }

  async downloadDocument(downloadRequest: DocumentDownloadRequest): Promise<string | null> {
    const { documentId, version, userId } = downloadRequest;
    
    const document = await this.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check permissions - allow access if user ID matches OR if it's a demo user accessing demo documents
    const hasDirectAccess = document.accessPermissions.canDownload.includes(userId);
    const isDemoAccess = userId.includes('demo') && document.customerId.includes('demo');
    const isCustomerAccess = document.accessPermissions.canDownload.includes(document.customerId) && 
                            (userId.includes('demo') || userId === document.customerId);
    
    if (!hasDirectAccess && !isDemoAccess && !isCustomerAccess) {
      console.error('Access denied for user:', userId, 'Document permissions:', document.accessPermissions);
      throw new Error('Access denied');
    }

    // Get the requested version or current version
    const versionIndex = version ? version - 1 : document.currentVersion;
    const documentVersion = document.versions[versionIndex];
    
    if (!documentVersion) {
      throw new Error('Version not found');
    }

    // Get download URL from R2
    const downloadUrl = await this.getR2DownloadUrl(documentVersion.r2Key);
    
    if (downloadUrl) {
      // Log access
      this.logDocumentAccess({
        documentId,
        userId,
        action: 'download'
      });

      // Update last accessed time
      document.lastAccessedAt = new Date().toISOString();
      const documents = await this.getDocuments();
      const index = documents.findIndex(d => d.id === documentId);
      documents[index] = document;
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    }

    return downloadUrl;
  }

  async deleteDocumentVersion(documentId: string, version: number, userId: string): Promise<boolean> {
    const document = await this.getDocumentById(documentId);
    if (!document) {
      return false;
    }

    // Only allow admins to delete versions
    // This check should be enhanced based on your role system
    if (!userId.includes('admin')) {
      throw new Error('Only administrators can delete document versions');
    }

    const versionIndex = version - 1;
    if (versionIndex < 0 || versionIndex >= document.versions.length) {
      return false;
    }

    // Don't allow deleting the only version
    if (document.versions.length === 1) {
      throw new Error('Cannot delete the only version of a document');
    }

    // Remove version
    document.versions.splice(versionIndex, 1);
    
    // Update current version index if necessary
    if (document.currentVersion >= versionIndex) {
      document.currentVersion = Math.max(0, document.currentVersion - 1);
    }

    document.updatedAt = new Date().toISOString();

    // Save to storage
    const documents = await this.getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    documents[index] = document;
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));

    // Log access
    this.logDocumentAccess({
      documentId,
      userId,
      action: 'delete'
    });

    return true;
  }

  // Access Management
  async getDocumentAccessLog(documentId?: string): Promise<DocumentAccess[]> {
    const accessLog: DocumentAccess[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESS_LOG) || '[]');
    
    if (documentId) {
      return accessLog.filter(log => log.documentId === documentId);
    }
    
    return accessLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async updateDocumentPermissions(
    documentId: string, 
    permissions: Document['accessPermissions'], 
    userId: string
  ): Promise<boolean> {
    const document = await this.getDocumentById(documentId);
    if (!document) {
      return false;
    }

    // Only allow admins and document creator to update permissions
    if (document.createdBy !== userId && !userId.includes('admin')) {
      throw new Error('Access denied');
    }

    document.accessPermissions = permissions;
    document.updatedAt = new Date().toISOString();

    // Save to storage
    const documents = await this.getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    documents[index] = document;
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));

    return true;
  }
}

export const documentService = new DocumentService();