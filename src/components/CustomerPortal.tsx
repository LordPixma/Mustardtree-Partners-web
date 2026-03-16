import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useCloudflareAuth } from '../services/cloudflareAuthService';
import { documentApi, folderApi, statsApi, activityApi, ApiError } from '../services/apiClient';
import type { Document, DocumentFolder } from '../types/documents';
import type { PortalStats, ActivityEntry } from '../services/apiClient';
import {
  Upload,
  Download,
  File,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Folder,
  FolderPlus,
  FolderEdit,
  Search,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  History,
  Shield,
  HardDrive,
  Activity,
  Trash2,
  Check,
  Square,
  CheckSquare,
  Menu,
  Moon,
  Sun,
  Keyboard,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { validateDocumentUpload } from '../utils/fileValidation';

// ----- Skeleton loader -----
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-gray-200 dark:bg-gray-700", className)} />;
}

function DocumentSkeleton() {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <Skeleton className="w-4 h-4" />
      <Skeleton className="w-5 h-5 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-16 hidden sm:block" />
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface CustomerPortalProps {
  onError?: (error: string) => void;
}

// ----- Helper: file type icon -----
function FileIcon({ mimeType, className }: { mimeType?: string; className?: string }) {
  if (!mimeType) return <File className={className} />;
  if (mimeType.startsWith('image/')) return <ImageIcon className={cn(className, 'text-purple-500')} />;
  if (mimeType === 'application/pdf') return <FileText className={cn(className, 'text-red-500')} />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return <FileSpreadsheet className={cn(className, 'text-green-600')} />;
  if (mimeType.includes('document') || mimeType.includes('word')) return <FileText className={cn(className, 'text-blue-600')} />;
  return <File className={cn(className, 'text-gray-400')} />;
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
  const [isDragOver, setIsDragOver] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const PAGE_SIZE = 25;

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterConfidential, setFilterConfidential] = useState(false);
  const [filterFileType, setFilterFileType] = useState('');

  // Stats dashboard
  const [stats, setStats] = useState<PortalStats | null>(null);

  // Panels
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [versionDoc, setVersionDoc] = useState<Document | null>(null);
  const [activityDoc, setActivityDoc] = useState<Document | null>(null);
  const [activityData, setActivityData] = useState<ActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Folder management
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');

  // Bulk operations
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isDev = import.meta.env.DEV;
  const isAdminOrStaff = userRole === 'admin' || userRole === 'staff';

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // ----- Dark Mode Toggle -----
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  }, []);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  // ----- Keyboard Shortcuts -----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl/Cmd+K: focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Ctrl/Cmd+U: open upload
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        setShowUpload(true);
      }
      // Escape: close panels/modals
      if (e.key === 'Escape') {
        if (previewDoc) { closePreview(); return; }
        if (versionDoc) { setVersionDoc(null); return; }
        if (activityDoc) { setActivityDoc(null); return; }
        if (showUpload) { setShowUpload(false); return; }
        if (sidebarOpen) { setSidebarOpen(false); return; }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewDoc, versionDoc, activityDoc, showUpload, sidebarOpen]);

  // ----- Data Loading -----
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const customerIdToUse = customerId || undefined;

        const [docsResult, foldersData, statsData] = await Promise.all([
          documentApi.getDocuments({
            customerId: customerIdToUse,
            folderId: selectedFolder,
            search: searchTerm || undefined,
            confidentialOnly: filterConfidential || undefined,
            fileTypes: filterFileType ? [filterFileType] : undefined,
            page,
            limit: PAGE_SIZE,
          }),
          folderApi.getFolders(customerIdToUse),
          statsApi.getStats(customerIdToUse),
        ]);

        setDocuments(docsResult.documents);
        setTotalPages(docsResult.pagination.totalPages);
        setTotalDocs(docsResult.pagination.total);
        setFolders(foldersData);
        setStats(statsData);
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

    if (!authLoading) loadData();
  }, [authLoading, customerId, selectedFolder, searchTerm, filterConfidential, filterFileType, page, onError, showNotification]);

  useEffect(() => { setPage(1); }, [searchTerm, selectedFolder, filterConfidential, filterFileType]);

  // ----- Drag and Drop -----
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, user, selectedFolder]);

  // ----- Upload -----
  const handleFileUpload = async (files: FileList) => {
    const customerIdToUse = customerId;
    if (!customerIdToUse) {
      showNotification('error', 'Customer ID not available');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadId = `${file.name}-${Date.now()}`;

      const validation = validateDocumentUpload(file);
      if (!validation.isValid) {
        showNotification('error', `${file.name}: ${validation.error}`);
        continue;
      }

      try {
        setUploadProgress(prev => ({ ...prev, [uploadId]: { progress: 30, status: 'uploading' } }));

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
        setTotalDocs(prev => prev + 1);
        showNotification('success', `${file.name} uploaded successfully`);

        setTimeout(() => {
          setUploadProgress(prev => { const u = { ...prev }; delete u[uploadId]; return u; });
        }, 2000);
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Upload failed';
        setUploadProgress(prev => ({ ...prev, [uploadId]: { progress: 0, status: 'error', error: message } }));
        showNotification('error', `${file.name}: ${message}`);
        setTimeout(() => {
          setUploadProgress(prev => { const u = { ...prev }; delete u[uploadId]; return u; });
        }, 5000);
      }
    }

    setSelectedFiles(null);
    setShowUpload(false);
    setUploadDescription('');
    setUploadTags('');
    setUploadConfidential(false);
  };

  // ----- Download / View -----
  const handleDownload = async (doc: Document, version?: number) => {
    try {
      const { blob, fileName } = await documentApi.downloadDocument(doc.id, version);
      const url = URL.createObjectURL(blob);
      const link = globalThis.document.createElement('a');
      link.href = url;
      link.download = fileName;
      globalThis.document.body.appendChild(link);
      link.click();
      globalThis.document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      showNotification('error', error instanceof ApiError ? error.message : 'Download failed');
    }
  };

  const handlePreview = async (doc: Document) => {
    const currentVersion = doc.versions[doc.currentVersion];
    const viewableTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!currentVersion || !viewableTypes.includes(currentVersion.mimeType)) {
      handleDownload(doc);
      return;
    }
    setPreviewDoc(doc);
    setPreviewLoading(true);
    try {
      const { blob } = await documentApi.downloadDocument(doc.id);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      showNotification('error', 'Failed to load preview');
      setPreviewDoc(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewDoc(null);
  }, [previewUrl]);

  // ----- Activity -----
  const openActivity = async (doc: Document) => {
    setActivityDoc(doc);
    setActivityLoading(true);
    try {
      const data = await activityApi.getDocumentActivity(doc.id);
      setActivityData(data);
    } catch {
      setActivityData([]);
    } finally {
      setActivityLoading(false);
    }
  };

  // ----- Folder Management -----
  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !customerId) return;
    try {
      const folder = await folderApi.createFolder({ name: newFolderName.trim(), customerId });
      setFolders(prev => [...prev, folder]);
      setNewFolderName('');
      setShowNewFolder(false);
      showNotification('success', `Folder "${folder.name}" created`);
    } catch (error) {
      showNotification('error', error instanceof ApiError ? error.message : 'Failed to create folder');
    }
  };

  const handleRenameFolder = async (folderId: string) => {
    if (!renameFolderName.trim()) return;
    try {
      const updated = await folderApi.renameFolder(folderId, renameFolderName.trim());
      setFolders(prev => prev.map(f => f.id === folderId ? updated : f));
      setRenamingFolder(null);
      setRenameFolderName('');
      showNotification('success', 'Folder renamed');
    } catch (error) {
      showNotification('error', error instanceof ApiError ? error.message : 'Failed to rename folder');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await folderApi.deleteFolder(folderId);
      setFolders(prev => prev.filter(f => f.id !== folderId));
      if (selectedFolder === folderId) setSelectedFolder(undefined);
      showNotification('success', 'Folder deleted. Documents moved to root.');
    } catch (error) {
      showNotification('error', error instanceof ApiError ? error.message : 'Failed to delete folder');
    }
  };

  // ----- Bulk Operations -----
  const toggleDocSelection = (docId: string) => {
    setSelectedDocIds(prev => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId); else next.add(docId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedDocIds.size === documents.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(documents.map(d => d.id)));
    }
  };

  const handleBulkDownload = async () => {
    for (const docId of selectedDocIds) {
      const doc = documents.find(d => d.id === docId);
      if (doc) await handleDownload(doc);
    }
    setSelectedDocIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (!isAdminOrStaff) return;
    setBulkDeleting(true);
    let deleted = 0;
    for (const docId of selectedDocIds) {
      try {
        await documentApi.deleteDocument(docId);
        deleted++;
      } catch { /* continue */ }
    }
    setDocuments(prev => prev.filter(d => !selectedDocIds.has(d.id)));
    setSelectedDocIds(new Set());
    setBulkDeleting(false);
    showNotification('success', `${deleted} document(s) deleted`);
  };

  // ----- Formatting -----
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatRelativeDate = (dateString: string): string => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(dateString);
  };

  const selectedFolderName = useMemo(() => {
    if (!selectedFolder) return 'All Documents';
    return folders.find(f => f.id === selectedFolder)?.name || 'Unknown';
  }, [selectedFolder, folders]);

  // ----- Auth Guards -----
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  const hasProperAccess = hasCustomerAccess || isAdminOrStaff;
  if (!isDev && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the customer portal.</p>
          <button onClick={() => window.location.href = '/admin/login'} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">Log In</button>
        </div>
      </div>
    );
  }

  if (isAuthenticated && !hasProperAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the customer portal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Toast */}
      {notification && (
        <div className={cn(
          "fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium",
          notification.type === 'success' ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800" : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800"
        )}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
          <button onClick={() => setNotification(null)} className="ml-2"><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Portal</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Welcome, {user?.name || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Keyboard shortcut hint */}
              <div className="hidden md:flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                <Keyboard className="w-3 h-3" />
                <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">Ctrl+K</kbd> search
                <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono ml-1">Ctrl+U</kbd> upload
              </div>
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                {userRole === 'customer' ? 'Customer' : userRole === 'admin' ? 'Admin' : userRole === 'staff' ? 'Staff' : 'User'}
              </span>
              {isDev && !isAuthenticated && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Dev</span>
              )}
              {user && (
                <button onClick={logout} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">Logout</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!stats ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Documents', value: stats.totalDocuments, icon: FileText, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' },
              { label: 'Storage Used', value: formatFileSize(stats.totalStorageBytes), icon: HardDrive, color: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' },
              { label: 'Folders', value: stats.totalFolders, icon: Folder, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400' },
              { label: 'Activity (7d)', value: stats.recentActivityCount, icon: Activity, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', color)}><Icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - collapsible on mobile */}
          <div className={cn(
            "lg:col-span-1 space-y-4",
            // Mobile: fixed sidebar drawer
            "fixed lg:static inset-y-0 left-0 z-40 w-72 lg:w-auto",
            "bg-gray-50 dark:bg-gray-900 lg:bg-transparent p-4 lg:p-0",
            "transform transition-transform duration-200 lg:transform-none overflow-y-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}>
            {/* Mobile sidebar header */}
            <div className="flex items-center justify-between lg:hidden mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Menu</h3>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded text-gray-500"><X className="w-5 h-5" /></button>
            </div>

            {/* Upload Button */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <button
                onClick={() => { setShowUpload(true); setSidebarOpen(false); }}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </button>
            </div>

            {/* Folders */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Folders</h4>
                <button onClick={() => setShowNewFolder(true)} className="text-blue-600 hover:text-blue-700">
                  <FolderPlus className="w-4 h-4" />
                </button>
              </div>

              {showNewFolder && (
                <div className="mb-3 flex gap-1">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    placeholder="Folder name"
                    autoFocus
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button onClick={handleCreateFolder} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Add</button>
                  <button onClick={() => { setShowNewFolder(false); setNewFolderName(''); }} className="px-2 py-1 border border-gray-300 rounded text-xs">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="space-y-0.5">
                <button
                  onClick={() => setSelectedFolder(undefined)}
                  className={cn("w-full flex items-center px-3 py-2 text-sm rounded-md", !selectedFolder ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700")}
                >
                  <Folder className="w-4 h-4 mr-2" /> All Documents
                </button>
                {folders.map((folder) => (
                  <div key={folder.id} className="group relative">
                    {renamingFolder === folder.id ? (
                      <div className="flex gap-1 px-1 py-1">
                        <input
                          type="text"
                          value={renameFolderName}
                          onChange={(e) => setRenameFolderName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder(folder.id)}
                          autoFocus
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button onClick={() => handleRenameFolder(folder.id)} className="text-green-600"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setRenamingFolder(null)} className="text-gray-400"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedFolder(folder.id)}
                        className={cn("w-full flex items-center px-3 py-2 text-sm rounded-md", selectedFolder === folder.id ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700")}
                      >
                        <Folder className="w-4 h-4 mr-2" />
                        <span className="flex-1 text-left truncate">{folder.name}</span>
                        <span className="hidden group-hover:flex items-center gap-0.5">
                          <FolderEdit className="w-3 h-3 text-gray-400 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); setRenamingFolder(folder.id); setRenameFolderName(folder.name); }} />
                          <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} />
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Uploads</h4>
                <div className="space-y-2">
                  {Object.entries(uploadProgress).map(([uploadId, { progress, status, error }]) => (
                    <div key={uploadId} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600 truncate max-w-[140px]">{uploadId.split('-')[0]}</span>
                        <span className={cn(status === 'done' ? "text-green-600" : status === 'error' ? "text-red-600" : "text-gray-500")}>
                          {status === 'done' ? 'Done' : status === 'error' ? 'Failed' : `${Math.round(progress)}%`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={cn("h-1.5 rounded-full transition-all", status === 'done' ? "bg-green-500" : status === 'error' ? "bg-red-500" : "bg-blue-600")} style={{ width: `${progress}%` }} />
                      </div>
                      {error && <p className="text-red-500 mt-1">{error}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search + Filters + Bulk Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search documents... (Ctrl+K)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn("inline-flex items-center px-3 py-2 border rounded-lg text-sm", showFilters ? "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300" : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700")}
                >
                  <Filter className="w-4 h-4 mr-1" /> Filters
                  {(filterConfidential || filterFileType) && <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full" />}
                </button>
              </div>

              {showFilters && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="checkbox" checked={filterConfidential} onChange={(e) => setFilterConfidential(e.target.checked)} className="rounded border-gray-300 dark:border-gray-600 text-blue-600" />
                    Confidential only
                  </label>
                  <select
                    value={filterFileType}
                    onChange={(e) => setFilterFileType(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All file types</option>
                    <option value="application/pdf">PDF</option>
                    <option value="image/">Images</option>
                    <option value="spreadsheet">Spreadsheets</option>
                    <option value="document">Word Docs</option>
                    <option value="text/">Text Files</option>
                  </select>
                  {(filterConfidential || filterFileType) && (
                    <button onClick={() => { setFilterConfidential(false); setFilterFileType(''); }} className="text-xs text-blue-600 hover:underline">Clear filters</button>
                  )}
                </div>
              )}

              {/* Bulk Operations Bar */}
              {selectedDocIds.size > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">{selectedDocIds.size} selected</span>
                  <button onClick={handleBulkDownload} className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                    <Download className="w-3 h-3 mr-1" /> Download All
                  </button>
                  {isAdminOrStaff && (
                    <button onClick={handleBulkDelete} disabled={bulkDeleting} className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 disabled:opacity-50">
                      {bulkDeleting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />} Delete All
                    </button>
                  )}
                  <button onClick={() => setSelectedDocIds(new Set())} className="text-xs text-gray-500 hover:underline">Clear selection</button>
                </div>
              )}
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <button onClick={() => setSelectedFolder(undefined)} className="hover:text-blue-600 dark:hover:text-blue-400">Documents</button>
              {selectedFolder && (
                <>
                  <ChevronRight className="w-4 h-4 mx-1" />
                  <span className="text-gray-900 dark:text-white font-medium">{selectedFolderName}</span>
                </>
              )}
              <span className="ml-auto text-xs">{totalDocs} document{totalDocs !== 1 ? 's' : ''}</span>
            </div>

            {/* Drag-and-Drop Zone + Document List */}
            <div
              ref={dropRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-all",
                isDragOver && "ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-gray-900"
              )}
            >
              {/* Drag overlay */}
              {isDragOver && (
                <div className="absolute inset-0 bg-blue-50/90 z-10 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-400">
                  <Upload className="w-10 h-10 text-blue-500 mb-3" />
                  <p className="text-lg font-medium text-blue-700">Drop files to upload</p>
                  <p className="text-sm text-blue-500">PDF, images, Office docs, text files</p>
                </div>
              )}

              {/* Select All Header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {selectedDocIds.size === documents.length && documents.length > 0
                    ? <CheckSquare className="w-4 h-4 text-blue-600" />
                    : <Square className="w-4 h-4" />}
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Name</span>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide hidden sm:inline">Modified</span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {isLoading ? (
                  <div>
                    {[1, 2, 3, 4, 5, 6].map(i => <DocumentSkeleton key={i} />)}
                  </div>
                ) : documents.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No documents</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {searchTerm ? 'No documents match your search.' : 'Drag files here or click Upload to get started.'}
                    </p>
                    {!searchTerm && (
                      <button onClick={() => setShowUpload(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        <Upload className="w-4 h-4 mr-2 inline" /> Upload Document
                      </button>
                    )}
                  </div>
                ) : (
                  documents.map((doc) => {
                    const ver = doc.versions[doc.currentVersion];
                    const isSelected = selectedDocIds.has(doc.id);
                    return (
                      <div key={doc.id} className={cn("px-4 py-3 flex items-center gap-3 group hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors", isSelected && "bg-blue-50 dark:bg-blue-900/20")}>
                        <button onClick={() => toggleDocSelection(doc.id)} className="text-gray-400 hover:text-gray-600 shrink-0">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                        </button>
                        <FileIcon mimeType={ver?.mimeType} className="w-5 h-5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                            {doc.isConfidential && <Shield className="w-3 h-3 text-red-500 shrink-0" />}
                            {doc.versions.length > 1 && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono">v{doc.currentVersion + 1}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {doc.description && <p className="text-xs text-gray-400 truncate max-w-[200px]">{doc.description}</p>}
                            <span className="text-xs text-gray-400">{formatFileSize(ver?.fileSize || 0)}</span>
                            {doc.tags && doc.tags.length > 0 && doc.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{tag}</span>
                            ))}
                            {doc.tags && doc.tags.length > 2 && (
                              <span className="text-[10px] text-gray-400">+{doc.tags.length - 2}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 hidden sm:inline shrink-0">{formatRelativeDate(doc.updatedAt)}</span>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => handlePreview(doc)} title="Preview" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"><Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" /></button>
                          <button onClick={() => handleDownload(doc)} title="Download" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"><Download className="w-4 h-4 text-gray-500 dark:text-gray-400" /></button>
                          {doc.versions.length > 1 && (
                            <button onClick={() => setVersionDoc(doc)} title="Version history" className="p-1.5 rounded hover:bg-gray-200"><History className="w-4 h-4 text-gray-500" /></button>
                          )}
                          <button onClick={() => openActivity(doc)} title="Activity" className="p-1.5 rounded hover:bg-gray-200"><Activity className="w-4 h-4 text-gray-500" /></button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 dark:text-gray-300"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 dark:text-gray-300"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MODALS & PANELS ===== */}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20" onClick={() => setShowUpload(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Documents</h3>
              <button onClick={() => { setShowUpload(false); setSelectedFiles(null); }}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    setSelectedFiles(files);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedFiles ? `${selectedFiles.length} file(s) selected` : 'Drop files here or click to browse'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max 100MB. PDF, images, Office docs, text files.</p>
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.docx,.xlsx,.pptx,.txt,.csv" onChange={(e) => setSelectedFiles(e.target.files)} className="hidden" />
              </div>

              {selectedFiles && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {Array.from(selectedFiles).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 py-1 text-sm">
                      <FileIcon mimeType={f.type} className="w-4 h-4" />
                      <span className="truncate flex-1">{f.name}</span>
                      <span className="text-xs text-gray-400">{formatFileSize(f.size)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input type="text" value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder="Brief description" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
                <input type="text" value={uploadTags} onChange={(e) => setUploadTags(e.target.value)} placeholder="e.g. report, quarterly" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={uploadConfidential} onChange={(e) => setUploadConfidential(e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                Mark as confidential
              </label>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
              <button onClick={() => { setShowUpload(false); setSelectedFiles(null); setUploadDescription(''); setUploadTags(''); setUploadConfidential(false); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100">Cancel</button>
              <button onClick={() => selectedFiles && handleFileUpload(selectedFiles)} disabled={!selectedFiles || selectedFiles.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Upload</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Panel */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={closePreview}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 shrink-0">
              <div className="flex items-center gap-3">
                <FileIcon mimeType={previewDoc.versions[previewDoc.currentVersion]?.mimeType} className="w-5 h-5" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{previewDoc.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownload(previewDoc)} className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"><Download className="w-4 h-4 inline mr-1" />Download</button>
                <button onClick={closePreview}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
              {previewLoading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : previewUrl ? (
                previewDoc.versions[previewDoc.currentVersion]?.mimeType === 'application/pdf' ? (
                  <iframe src={previewUrl} className="w-full h-full min-h-[60vh]" title="PDF Preview" />
                ) : (
                  <div className="h-full flex items-center justify-center p-8">
                    <img src={previewUrl} alt={previewDoc.name} className="max-w-full max-h-[70vh] object-contain rounded shadow" />
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Version History Drawer */}
      {versionDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setVersionDoc(null)}>
          <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Version History</h3>
              <button onClick={() => setVersionDoc(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="px-6 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-850 shrink-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{versionDoc.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{versionDoc.versions.length} version{versionDoc.versions.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {[...versionDoc.versions].reverse().map((ver) => (
                <div key={ver.id} className={cn("px-6 py-4 border-b border-gray-100 dark:border-gray-700", ver.version === versionDoc.currentVersion && "bg-blue-50 dark:bg-blue-900/20")}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Version {ver.version + 1}</span>
                      {ver.version === versionDoc.currentVersion && <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">Current</span>}
                    </div>
                    <button onClick={() => handleDownload(versionDoc, ver.version)} className="text-blue-600 hover:text-blue-700"><Download className="w-4 h-4" /></button>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(ver.uploadedAt)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ver.fileName} - {formatFileSize(ver.fileSize)}</p>
                  {ver.changeNote && <p className="text-xs text-gray-600 mt-1 italic">"{ver.changeNote}"</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Drawer */}
      {activityDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setActivityDoc(null)}>
          <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity</h3>
              <button onClick={() => setActivityDoc(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="px-6 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-850 shrink-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activityDoc.name}</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {activityLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
              ) : activityData.length === 0 ? (
                <div className="text-center py-12 text-sm text-gray-500">No activity recorded</div>
              ) : (
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                  {activityData.map((entry, i) => (
                    <div key={i} className="relative px-6 py-3 flex items-start gap-3">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 relative z-10 ring-2 ring-white",
                        entry.action === 'upload' ? "bg-green-500" : entry.action === 'download' ? "bg-blue-500" : entry.action === 'delete' ? "bg-red-500" : "bg-gray-400"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          <span className="font-medium">{entry.userEmail || entry.userId}</span>
                          <span className="text-gray-500 dark:text-gray-400"> {entry.action}ed</span>
                          {entry.details && <span className="text-gray-400 dark:text-gray-500"> - {entry.details}</span>}
                        </p>
                        <p className="text-xs text-gray-400">{formatRelativeDate(entry.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
