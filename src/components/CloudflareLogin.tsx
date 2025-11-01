import React from 'react';
import { useCloudflareAuth } from '../services/cloudflareAuthService';
import { Loader2, Shield, User, LogIn } from 'lucide-react';

interface CloudflareLoginProps {
  onAuthSuccess?: () => void;
}

export const CloudflareLogin: React.FC<CloudflareLoginProps> = ({ onAuthSuccess }) => {
  const { user, isLoading, isAuthenticated, hasAdminAccess, login, logout } = useCloudflareAuth();

  // Auto-redirect on successful authentication
  React.useEffect(() => {
    if (isAuthenticated && hasAdminAccess && onAuthSuccess) {
      onAuthSuccess();
    }
  }, [isAuthenticated, hasAdminAccess, onAuthSuccess]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking Authentication</h2>
            <p className="text-gray-600">Please wait while we verify your access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && !hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You are authenticated as <strong>{user?.email}</strong>, but you don't have admin access to this blog.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              If you believe this is an error, please contact your administrator.
            </p>
            <button
              onClick={logout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome!</h2>
            <p className="text-gray-600 mb-4">
              Successfully authenticated as <strong>{user?.name || user?.email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You have admin access to the MustardTree Partners blog.
            </p>
            <div className="space-y-3">
              <button
                onClick={onAuthSuccess}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Continue to Admin Dashboard
              </button>
              <button
                onClick={logout}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - show login screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">MustardTree Partners</h1>
          <h2 className="text-lg font-semibold text-gray-700 mb-6">Blog Admin Access</h2>
          
          <p className="text-gray-600 mb-8">
            This blog admin area is protected by Cloudflare Access. 
            Click below to authenticate with your authorized account.
          </p>

          <button
            onClick={login}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <LogIn className="h-5 w-5" />
            <span>Sign in with Cloudflare Access</span>
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Powered by Cloudflare Access for enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Development-only login component for testing
 */
export const DevelopmentLogin: React.FC<CloudflareLoginProps> = ({ onAuthSuccess }) => {
  const [mockEmail, setMockEmail] = React.useState('dev@mustardtreepartners.com');
  const [mockName, setMockName] = React.useState('Development User');

  const handleMockLogin = () => {
    // Import the service dynamically to avoid import issues
    import('../services/cloudflareAuthService').then(({ CloudflareAccessService }) => {
      CloudflareAccessService.mockAuthenticatedUser({
        id: mockEmail,
        email: mockEmail,
        name: mockName,
        groups: ['admin']
      });
      
      // Reload the page to trigger re-authentication
      window.location.reload();
    });
  };

  if (process.env.NODE_ENV !== 'development') {
    return <CloudflareLogin onAuthSuccess={onAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Development Mode</h1>
          <p className="text-sm text-yellow-600">Mock authentication for testing</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="mockEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Mock Email
            </label>
            <input
              id="mockEmail"
              type="email"
              value={mockEmail}
              onChange={(e) => setMockEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter mock email"
            />
          </div>

          <div>
            <label htmlFor="mockName" className="block text-sm font-medium text-gray-700 mb-1">
              Mock Name
            </label>
            <input
              id="mockName"
              type="text"
              value={mockName}
              onChange={(e) => setMockName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter mock name"
            />
          </div>

          <button
            onClick={handleMockLogin}
            className="w-full bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2"
          >
            <LogIn className="h-5 w-5" />
            <span>Mock Login (Development)</span>
          </button>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Try Real Cloudflare Access
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            ⚠️ Development mode only - not available in production
          </p>
        </div>
      </div>
    </div>
  );
};