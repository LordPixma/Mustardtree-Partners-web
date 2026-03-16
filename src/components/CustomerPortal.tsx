import React, { useState, useEffect, useCallback } from 'react';
import { useCloudflareAuth } from '../services/cloudflareAuthService';
import { documentApi, folderApi, ApiError } from '../services/apiClient';
import type { Document, DocumentFolder } from '../types/documents';
import {
  Upload,
  Download,
  File,
  Folder,
  Search,
  Filter,
  Eye,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { validateDocumentUpload } from '../utils/fileValidation';

interface CustomerPortalProps {
  onError?: (error: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onError }) => {
  const { user, isLoading: authLoading, isAuthenticated, hasCustomerAccess, customerId, userRole, logout } = useCloudflareAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<Record<string, { progress: number; status: 'uploading' | 'done' | 'error'; error?: string }>>({});
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadConfidential, setUploadConfidential] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const PAGE_SIZE = 25;

  // Filter panel
  const [showFilters, setShowFilters] = useState(false);
  const [filterConfidential, setFilterConfidential] = useState(false);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Check if running in dev mode
  const isDev = import.meta.env.DEV;

  // Load documents and folders
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const customerIdToUse = customerId || undefined;

        const [docsResult, foldersData] = await Promise.all([
          documentApi.getDocuments({
            customerId: customerIdToUse,
            folderId: selectedFolder,
            search: searchTerm || undefined,
            confidentialOnly: filterConfidential || undefined,
            page,
            limit: PAGE_SIZE,
          }),
          folderApi.getFolders(customerIdToUse),
        ]);

        setDocuments(docsResult.documents);
        setTotalPages(docsResult.pagination.totalPages);
        setTotalDocs(docsResult.pagination.total);
        setFolders(foldersData);
      } catch (error) {
        console.error('Failed to load data:', error);
        setDocuments([]);
        setFolders([]);

        if (error instanceof ApiError && error.status === 401) {
          showNotification('error', 'Session expired. Please log in again.');
        } else {
          onError?.('Failed to load documents');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [authLoading, customerId, selectedFolder, searchTerm, filterConfidential, page, onError, showNotification]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedFolder, filterConfidential]);

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    const customerIdToUse = customerId;
    if (!customerIdToUse) {
      showNotification('error', 'Customer ID not available');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadId = `${file.name}-${Date.now()}`;

      // Client-side validation
      const validation = validateDocumentUpload(file);
      if (!validation.isValid) {
        showNotification('error', `${file.name}: ${validation.error}`);
        continue;
      }

      try {
        setUploadProgress(prev => ({ ...prev, [uploadId]: { progress: 50, status: 'uploading' } }));

        const newDoc = await documentApi.uploadDocument({
          file,
          customerId: customerIdToUse,
          folderId: selectedFolder,
          description: uploadDescription || `Uploaded by ${user?.name || user?.email}`,
          tags: uploadTags ? uploadTags.split(',').map(t => t.trim()).filter(Boolean) : ['customer-upload'],
          isConfidential: uploadConfidential,
        });

        setUploadProgress(prev => ({ ...prev, [uploadId]: { progress: 100, status: 'done' } }));
        setDocuments(prev => [newDoc, ...prev]);
        showNotification('success', `${file.name} uploaded successfully`);

        setTimeout(() => {
          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[uploadId];
            return updated;
          });
        }, 2000);
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Upload failed';
        setUploadProgress(prev => ({ ...prev, [uploadId]: { progress: 0, status: 'error', error: message } }));
        showNotification('error', `${file.name}: ${message}`);

        setTimeout(() => {
          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[uploadId];
            return updated;
          });
        }, 5000);
      }
    }

    setSelectedFiles(null);
    setShowUpload(false);
    setUploadDescription('');
    setUploadTags('');
    setUploadConfidential(false);
  };

  // Handle document download
  const handleDownload = async (doc: Document) => {
    try {
      const { blob, fileName } = await documentApi.downloadDocument(doc.id);
      const url = URL.createObjectURL(blob);
      const link = globalThis.document.createElement('a');
      link.href = url;
      link.download = fileName;
      globalThis.document.body.appendChild(link);
      link.click();
      globalThis.document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Download failed';
      showNotification('error', message);
    }
  };

  // Handle document view (open in new tab for PDFs/images)
  const handleView = async (doc: Document) => {
    try {
      const { blob, fileName } = await documentApi.downloadDocument(doc.id);
      const url = URL.createObjectURL(blob);

      // For PDFs and images, open in new tab
      const viewableTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const currentVersion = doc.versions[doc.currentVersion];
      if (currentVersion && viewableTypes.includes(currentVersion.mimeType)) {
        window.open(url, '_blank');
      } else {
        // Fallback to download for non-viewable types
        const link = globalThis.document.createElement('a');
        link.href = url;
        link.download = fileName;
        globalThis.document.body.appendChild(link);
        link.click();
        globalThis.document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'View failed';
      showNotification('error', message);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // In production, require authentication. In dev, allow access for testing.
  const hasProperAccess = hasCustomerAccess || userRole === 'admin' || userRole === 'staff';
  if (!isDev && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the customer portal.</p>
          <button
            onClick={() => window.location.href = '/admin/login'}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (isAuthenticated && !hasProperAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the customer portal.</p>
          <p className="text-sm text-gray-500 mt-2">Please contact your administrator for access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notification */}
      {notification && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all",
          notification.type === 'success' ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
        )}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
          <button onClick={() => setNotification(null)} className="ml-2">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Portal</h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.name || user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {userRole === 'customer' ? 'Customer' : userRole === 'admin' ? 'Administrator' : userRole === 'staff' ? 'Staff' : 'User'}
              </span>
              {isDev && !isAuthenticated && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Dev Mode
                </span>
              )}
              {user && (
                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>

              {(userRole === 'customer' || userRole === 'admin' || userRole === 'staff') && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-4"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </button>
              )}

              {/* Folders */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Folders</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedFolder(undefined)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm rounded-md",
                      !selectedFolder
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    All Documents
                  </button>
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={cn(
                        "w-full flex items-center px-3 py-2 text-sm rounded-md",
                        selectedFolder === folder.id
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      {folder.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Uploads</h4>
                  <div className="space-y-2">
                    {Object.entries(uploadProgress).map(([uploadId, { progress, status, error }]) => (
                      <div key={uploadId} className="text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600 truncate max-w-[120px]">{uploadId.split('-')[0]}</span>
                          <span className={cn(
                            "text-xs",
                            status === 'done' ? "text-green-600" : status === 'error' ? "text-red-600" : "text-gray-500"
                          )}>
                            {status === 'done' ? 'Done' : status === 'error' ? 'Failed' : `${Math.round(progress)}%`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-300",
                              status === 'done' ? "bg-green-500" : status === 'error' ? "bg-red-500" : "bg-blue-600"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {error && <p className="text-red-500 mt-1">{error}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search documents by name, description, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium",
                    showFilters
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  )}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={filterConfidential}
                        onChange={(e) => setFilterConfidential(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Confidential only
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Documents ({totalDocs})
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                {isLoading ? (
                  <div className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading documents...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <File className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? 'No documents match your search.' : 'Get started by uploading a document.'}
                    </p>
                  </div>
                ) : (
                  documents.map((document) => {
                    const currentVersion = document.versions[document.currentVersion];
                    return (
                      <div key={document.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <File className="w-5 h-5 text-gray-400 mr-3" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {document.name}
                                    </p>
                                    {document.description && (
                                      <p className="text-sm text-gray-500 truncate">
                                        {document.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatDate(document.updatedAt)}
                                  </span>
                                  <span>{formatFileSize(currentVersion?.fileSize || 0)}</span>
                                  <span>v{document.currentVersion + 1}</span>
                                  {document.isConfidential && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Confidential
                                    </span>
                                  )}
                                </div>

                                {document.tags && document.tags.length > 0 && (
                                  <div className="mt-2 flex items-center flex-wrap gap-1">
                                    <Tag className="w-3 h-3 text-gray-400" />
                                    {document.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="ml-4 flex items-center space-x-2">
                                <button
                                  onClick={() => handleView(document)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </button>
                                <button
                                  onClick={() => handleDownload(document)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Page {page} of {totalPages} ({totalDocs} documents)
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[28rem] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
                <button onClick={() => { setShowUpload(false); setSelectedFiles(null); }}>
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Files
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.docx,.xlsx,.pptx,.txt,.csv"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max 100MB. PDF, images, Office docs, text files.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Brief description of the document"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="e.g. report, quarterly, finance"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={uploadConfidential}
                    onChange={(e) => setUploadConfidential(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Mark as confidential
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setSelectedFiles(null);
                    setUploadDescription('');
                    setUploadTags('');
                    setUploadConfidential(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedFiles && handleFileUpload(selectedFiles)}
                  disabled={!selectedFiles || selectedFiles.length === 0}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
