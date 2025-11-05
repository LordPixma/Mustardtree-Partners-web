import React, { useState, useEffect } from 'react';
import { useCloudflareAuth } from '../services/cloudflareAuthService';
import { documentService } from '../services/documentService';
import type { Document, Customer, DocumentAccess } from '../types/documents';
import { 
  Upload, 
  Download, 
  File, 
  Users, 
  Eye,
  Trash2,
  Edit,
  Plus,
  Search,
  Calendar,
  Shield,
  Activity,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

export const AdminDocumentManagement: React.FC = () => {
  const { user, hasAdminAccess, hasStaffAccess } = useCloudflareAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [accessLog, setAccessLog] = useState<DocumentAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'documents' | 'customers' | 'audit'>('documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    company: '',
    accessLevel: 'read-write' as 'read-only' | 'read-write'
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [customersData, accessLogData] = await Promise.all([
          documentService.getCustomers(),
          documentService.getDocumentAccessLog()
        ]);
        
        setCustomers(customersData);
        setAccessLog(accessLogData);
        
        // Select first customer by default
        if (customersData.length > 0) {
          setSelectedCustomer(customersData[0]);
        }
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (hasAdminAccess || hasStaffAccess) {
      loadData();
    }
  }, [hasAdminAccess, hasStaffAccess]);

  // Load documents for selected customer
  useEffect(() => {
    const loadCustomerDocuments = async () => {
      if (!selectedCustomer) {
        setDocuments([]);
        return;
      }

      try {
        const customerDocs = await documentService.getDocuments({
          customerId: selectedCustomer.id
        });
        setDocuments(customerDocs);
      } catch (error) {
        console.error('Failed to load customer documents:', error);
      }
    };

    loadCustomerDocuments();
  }, [selectedCustomer]);

  // Handle create customer
  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) return;

    try {
      const customer = await documentService.createCustomer({
        ...newCustomer,
        isActive: true
      });
      
      setCustomers(prev => [customer, ...prev]);
      setNewCustomer({ name: '', email: '', company: '', accessLevel: 'read-write' });
      setShowCreateCustomer(false);
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  // Handle document download
  const handleDownload = async (document: Document) => {
    if (!user) return;
    
    try {
      const downloadUrl = await documentService.downloadDocument({
        documentId: document.id,
        userId: user.id
      });
      
      if (downloadUrl) {
        const link = globalThis.document.createElement('a');
        link.href = downloadUrl;
        link.download = document.name;
        globalThis.document.body.appendChild(link);
        link.click();
        globalThis.document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc =>
    !searchTerm || 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter access log
  const filteredAccessLog = accessLog.filter(log =>
    !selectedCustomer || 
    documents.some(doc => doc.id === log.documentId && doc.customerId === selectedCustomer.id)
  );

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

  if (!hasAdminAccess && !hasStaffAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access document management.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading document management...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
              <p className="text-sm text-gray-600">
                Manage customer documents and access permissions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateCustomer(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'documents', label: 'Documents', icon: File },
              { key: 'customers', label: 'Customers', icon: Users },
              { key: 'audit', label: 'Audit Log', icon: Activity }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={cn(
                  "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center",
                  activeTab === key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Customer Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customers</h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className={cn(
                    "w-full flex items-center px-3 py-2 text-sm rounded-md text-left",
                    !selectedCustomer 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Users className="w-4 h-4 mr-2" />
                  All Customers
                </button>
                
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm rounded-md text-left",
                      selectedCustomer?.id === customer.id 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2 text-xs font-medium">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{customer.name}</p>
                      <p className="truncate text-xs text-gray-500">{customer.company}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Documents {selectedCustomer ? `for ${selectedCustomer.name}` : ''}
                    ({filteredDocuments.length})
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {filteredDocuments.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <File className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'No documents match your search.' : 'No documents found for this customer.'}
                      </p>
                    </div>
                  ) : (
                    filteredDocuments.map((document) => (
                      <div key={document.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start">
                              <File className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{document.name}</p>
                                {document.description && (
                                  <p className="text-sm text-gray-500 mt-1">{document.description}</p>
                                )}
                                
                                <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(document.updatedAt)}
                                  </span>
                                  <span>v{document.currentVersion + 1}</span>
                                  {document.isConfidential && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      <Shield className="w-3 h-3 mr-1" />
                                      Confidential
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
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
                            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                            {hasAdminAccess && (
                              <button className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50">
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Customers ({customers.length})
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <div key={customer.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4 text-sm font-medium">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                            {customer.company && (
                              <p className="text-xs text-gray-400">{customer.company}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            customer.accessLevel === 'read-write'
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          )}>
                            {customer.accessLevel}
                          </span>
                          <span className="text-xs text-gray-500">
                            Created {formatDate(customer.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Audit Log ({filteredAccessLog.length})
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {filteredAccessLog.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <Activity className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No activity</h3>
                      <p className="mt-1 text-sm text-gray-500">No document activity found.</p>
                    </div>
                  ) : (
                    filteredAccessLog.slice(0, 100).map((log, index) => (
                      <div key={`${log.documentId}-${log.timestamp}-${index}`} className="px-6 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={cn(
                              "w-2 h-2 rounded-full mr-3",
                              log.action === 'upload' ? "bg-green-500" :
                              log.action === 'download' ? "bg-blue-500" :
                              log.action === 'view' ? "bg-gray-500" : "bg-red-500"
                            )} />
                            <div>
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">{log.userId}</span>
                                <span className="text-gray-500"> {log.action}ed document </span>
                                <span className="font-medium">
                                  {documents.find(d => d.id === log.documentId)?.name || 'Unknown'}
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">{formatDate(log.timestamp)}</p>
                            </div>
                          </div>
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            log.action === 'upload' ? "bg-green-100 text-green-800" :
                            log.action === 'download' ? "bg-blue-100 text-blue-800" :
                            log.action === 'view' ? "bg-gray-100 text-gray-800" : "bg-red-100 text-red-800"
                          )}>
                            {log.action}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Customer Modal */}
      {showCreateCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Customer</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={newCustomer.company}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                  <select
                    value={newCustomer.accessLevel}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, accessLevel: e.target.value as 'read-only' | 'read-write' }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="read-write">Read & Write</option>
                    <option value="read-only">Read Only</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateCustomer(false);
                    setNewCustomer({ name: '', email: '', company: '', accessLevel: 'read-write' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomer}
                  disabled={!newCustomer.name || !newCustomer.email}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};