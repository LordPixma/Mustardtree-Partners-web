export interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  accessLevel: 'read-only' | 'read-write';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface DocumentFolder {
  id: string;
  name: string;
  customerId: string;
  parentFolderId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: string;
  version: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  r2Key: string;
  checksum: string;
  changeNote?: string;
}

export interface Document {
  id: string;
  name: string;
  description?: string;
  customerId: string;
  folderId?: string;
  currentVersion: number;
  versions: DocumentVersion[];
  tags?: string[];
  isConfidential: boolean;
  accessPermissions: {
    canView: string[];
    canDownload: string[];
    canUpload: string[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
}

export interface DocumentAccess {
  documentId: string;
  userId: string;
  action: 'view' | 'download' | 'upload' | 'delete';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UploadProgress {
  documentId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface CustomerPortalState {
  currentCustomer?: Customer;
  documents: Document[];
  folders: DocumentFolder[];
  isLoading: boolean;
  uploadProgress: UploadProgress[];
  selectedFolder?: string;
}

export interface AdminDocumentState {
  customers: Customer[];
  allDocuments: Document[];
  selectedCustomer?: Customer;
  documentAccess: DocumentAccess[];
  isLoading: boolean;
}

export interface CloudflareR2Config {
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
}

export interface DocumentSearchFilters {
  customerId?: string;
  folderId?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  confidentialOnly?: boolean;
  fileTypes?: string[];
}

export interface DocumentUploadRequest {
  file: File;
  customerId: string;
  folderId?: string;
  description?: string;
  tags?: string[];
  isConfidential?: boolean;
  changeNote?: string;
}

export interface DocumentDownloadRequest {
  documentId: string;
  version?: number;
  userId: string;
}