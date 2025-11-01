import React from 'react';
import { useCloudflareAuth } from '../services/cloudflareAuthService';
import { Loader2, Shield, LogIn } from 'lucide-react';

interface ProductionLoginProps {
  onAuthSuccess?: () => void;
}

export const ProductionLogin: React.FC<ProductionLoginProps> = ({ onAuthSuccess }) => {
  const { user, isLoading, isAuthenticated, hasAdminAccess, logout } = useCloudflareAuth();

  const handleLogin = async () => {
    try {
      const { CloudflareAccessService } = await import('../services/cloudflareAuthService');
      const config = CloudflareAccessService.getConfigFromEnv();
      
      if (!config) {
        alert('Authentication service not configured. Please contact support.');
        return;
      }

      const loginUrl = `https://${config.domain}/cdn-cgi/access/login`;
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Login failed:', error);
      alert(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

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
              You are authenticated as <strong>{user?.email}</strong>, but you don't have admin access.
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
            <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
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

  // Not authenticated - show production login screen
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
            This admin area is protected by Cloudflare Access. 
            Click below to authenticate with your authorized credentials.
          </p>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <LogIn className="h-5 w-5" />
            <span>Sign In with Cloudflare Access</span>
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Secure authentication powered by Cloudflare Zero Trust
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};