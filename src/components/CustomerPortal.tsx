import React, { useState, useEffect } from 'react';
import { useCloudflareAuth } from '../services/cloudflareAuthService';
import { documentService } from '../services/documentService';
import type { Document, DocumentFolder, DocumentUploadRequest } from '../types/documents';
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
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface CustomerPortalProps {
  onError?: (error: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onError }) => {
  const { user, isLoading: authLoading, hasCustomerAccess, customerId, userRole } = useCloudflareAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  // Load documents and folders
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('CustomerPortal: Starting data load...');
        
        // Use customerId if available, otherwise use demo customer for development
        const customerIdToUse = customerId || 'demo-customer-001';
        console.log('CustomerPortal: Using customer ID:', customerIdToUse);
        
        // Add timeout to prevent infinite loading
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Load timeout')), 5000)
        );
        
        const dataPromise = Promise.all([
          documentService.getDocuments({ customerId: customerIdToUse }),
          documentService.getFolders(customerIdToUse)
        ]);
        
        const [docsData, foldersData] = await Promise.race([dataPromise, timeout]) as [any[], any[]];
        
        console.log('CustomerPortal: Loaded documents:', docsData.length);
        console.log('CustomerPortal: Loaded folders:', foldersData.length);
        
        setDocuments(docsData);
        setFolders(foldersData);
      } catch (error) {
        console.error('CustomerPortal: Failed to load data:', error);
        // Set empty arrays instead of hanging
        setDocuments([]);
        setFolders([]);
        onError?.('Failed to load documents and folders');
      } finally {
        console.log('CustomerPortal: Data load complete, setting isLoading to false');
        setIsLoading(false);
      }
    };

    // Load data when auth loading is complete, regardless of customerId
    if (!authLoading) {
      console.log('CustomerPortal: Auth loading complete, starting data load');
      loadData();
    }
  }, [authLoading, customerId, onError]);

  // Filter documents based on search and folder
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFolder = !selectedFolder || doc.folderId === selectedFolder;
    
    return matchesSearch && matchesFolder;
  });

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!user || !customerId) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadId = `${file.name}-${Date.now()}`;
      
      try {
        setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));
        
        const uploadRequest: DocumentUploadRequest = {
          file,
          customerId,
          folderId: selectedFolder,
          description: `Uploaded by ${user.name || user.email}`,
          tags: ['customer-upload'],
          isConfidential: false
        };

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [uploadId]: Math.min((prev[uploadId] || 0) + Math.random() * 30, 90)
          }));
        }, 500);

        const newDoc = await documentService.uploadDocument(uploadRequest, user.id);
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [uploadId]: 100 }));
        
        // Update documents list
        setDocuments(prev => [newDoc, ...prev]);
        
        // Remove progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[uploadId];
            return updated;
          });
        }, 2000);
        
      } catch (error) {
        console.error('Upload failed:', error);
        onError?.(`Upload failed for ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[uploadId];
          return updated;
        });
      }
    }
    
    setSelectedFiles(null);
    setShowUpload(false);
  };

  // Handle document download
  const handleDownload = async (document: Document, version?: number) => {
    if (!user) return;
    
    try {
      const downloadUrl = await documentService.downloadDocument({
        documentId: document.id,
        version,
        userId: user.id
      });
      
      if (downloadUrl) {
        // Create a temporary link to trigger download
        const link = globalThis.document.createElement('a');
        link.href = downloadUrl;
        link.download = document.name;
        globalThis.document.body.appendChild(link);
        link.click();
        globalThis.document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
      onError?.(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading only for auth, not for data
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

  // Allow access in demo mode (when customerId is null) or when user has proper permissions
  const isDemoMode = !customerId;
  const hasProperAccess = hasCustomerAccess || userRole === 'admin' || userRole === 'staff';
  
  if (!isDemoMode && !hasProperAccess) {
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
                {userRole === 'customer' ? 'Customer' : userRole === 'admin' ? 'Administrator' : 'Staff'}
              </span>
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
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Uploading</h4>
                  <div className="space-y-2">
                    {Object.entries(uploadProgress).map(([uploadId, progress]) => (
                      <div key={uploadId} className="text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600">{uploadId.split('-')[0]}</span>
                          <span className="text-gray-500">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
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
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Documents ({filteredDocuments.length})
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {isLoading ? (
                  <div className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading documents...</p>
                    {!customerId && (
                      <p className="text-sm text-blue-600 mt-2">Demo mode - Cloudflare Access not configured</p>
                    )}
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <File className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? 'No documents match your search.' : 'Get started by uploading a document.'}
                    </p>
                  </div>
                ) : (
                  filteredDocuments.map((document) => {
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
                                  onClick={() => handleDownload(document)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </button>
                                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
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
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Files
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setSelectedFiles(null);
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