/**
 * API Client for MustardTree Document Portal
 *
 * All document operations go through the Cloudflare Worker backend.
 * No R2 credentials or direct storage access from the frontend.
 */

import type {
  Document,
  DocumentFolder,
  Customer,
  DocumentAccess,
  DocumentSearchFilters,
} from '../types/documents';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Send CF_Authorization cookie
    headers: {
      ...options.headers,
      // Don't set Content-Type for FormData (browser sets multipart boundary)
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(response.status, message);
  }

  // Handle download responses (binary)
  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) {
    return response as unknown as T;
  }

  return response.json();
}

// ----- Document Service API -----

export interface PaginatedDocuments {
  documents: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const documentApi = {
  /**
   * Get documents with filtering and pagination
   */
  async getDocuments(
    filters?: DocumentSearchFilters & { search?: string; page?: number; limit?: number },
  ): Promise<PaginatedDocuments> {
    const params = new URLSearchParams();
    if (filters?.customerId) params.set('customerId', filters.customerId);
    if (filters?.folderId) params.set('folderId', filters.folderId);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.confidentialOnly) params.set('confidentialOnly', 'true');
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    const query = params.toString();
    return apiFetch<PaginatedDocuments>(`/api/documents${query ? `?${query}` : ''}`);
  },

  /**
   * Upload a document
   */
  async uploadDocument(opts: {
    file: File;
    customerId: string;
    folderId?: string;
    description?: string;
    tags?: string[];
    isConfidential?: boolean;
    changeNote?: string;
  }): Promise<Document> {
    const formData = new FormData();
    formData.append('file', opts.file);
    formData.append('customerId', opts.customerId);
    if (opts.folderId) formData.append('folderId', opts.folderId);
    if (opts.description) formData.append('description', opts.description);
    if (opts.tags?.length) formData.append('tags', opts.tags.join(','));
    if (opts.isConfidential) formData.append('isConfidential', 'true');
    if (opts.changeNote) formData.append('changeNote', opts.changeNote);

    return apiFetch<Document>('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Download a document - returns a blob
   */
  async downloadDocument(
    documentId: string,
    version?: number,
  ): Promise<{ blob: Blob; fileName: string }> {
    const params = version ? `?version=${version}` : '';
    const response = await apiFetch<Response>(
      `/api/documents/${documentId}/download${params}`,
    );

    const disposition = response.headers.get('Content-Disposition') || '';
    const fileNameMatch = disposition.match(/filename="?([^"]+)"?/);
    const fileName = fileNameMatch ? decodeURIComponent(fileNameMatch[1]) : 'download';

    const blob = await response.blob();
    return { blob, fileName };
  },

  /**
   * Delete a document or specific version
   */
  async deleteDocument(documentId: string, version?: number): Promise<void> {
    const params = version ? `?version=${version}` : '';
    await apiFetch(`/api/documents/${documentId}${params}`, {
      method: 'DELETE',
    });
  },
};

// ----- Folder Service API -----

export const folderApi = {
  async getFolders(customerId?: string): Promise<DocumentFolder[]> {
    const params = customerId ? `?customerId=${customerId}` : '';
    const result = await apiFetch<{ folders: DocumentFolder[] }>(`/api/folders${params}`);
    return result.folders;
  },

  async createFolder(data: {
    name: string;
    customerId: string;
    parentFolderId?: string;
  }): Promise<DocumentFolder> {
    return apiFetch<DocumentFolder>('/api/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ----- Customer Service API -----

export const customerApi = {
  async getCustomers(): Promise<Customer[]> {
    const result = await apiFetch<{ customers: Customer[] }>('/api/customers');
    return result.customers;
  },

  async createCustomer(data: {
    name: string;
    email: string;
    company?: string;
    accessLevel?: string;
  }): Promise<Customer> {
    return apiFetch<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ----- Audit Log API -----

export const auditApi = {
  async getAccessLog(opts?: {
    documentId?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }): Promise<DocumentAccess[]> {
    const params = new URLSearchParams();
    if (opts?.documentId) params.set('documentId', opts.documentId);
    if (opts?.customerId) params.set('customerId', opts.customerId);
    if (opts?.page) params.set('page', String(opts.page));
    if (opts?.limit) params.set('limit', String(opts.limit));
    const query = params.toString();
    const result = await apiFetch<{ logs: DocumentAccess[] }>(`/api/audit-log${query ? `?${query}` : ''}`);
    return result.logs;
  },
};

// ----- Auth API -----

export const authApi = {
  async getMe(): Promise<{
    id: string;
    email: string;
    name?: string;
    role: 'admin' | 'staff' | 'customer' | null;
    customerId: string | null;
    groups: string[];
  }> {
    return apiFetch('/api/auth/me');
  },
};

export { ApiError };
