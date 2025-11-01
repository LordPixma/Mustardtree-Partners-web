import React from 'react';
import { useCloudflareAuth } from '../services/cloudflareAuthService';
import { Loader2, Shield, User, LogIn, AlertTriangle } from 'lucide-react';

interface DebugCloudflareLoginProps {
  onAuthSuccess?: () => void;
}

export const DebugCloudflareLogin: React.FC<DebugCloudflareLoginProps> = ({ onAuthSuccess }) => {
  const { user, isLoading, isAuthenticated, hasAdminAccess, logout } = useCloudflareAuth();
  const [debugInfo, setDebugInfo] = React.useState<any>(null);
  const [configError, setConfigError] = React.useState<string | null>(null);

  // Check configuration on mount
  React.useEffect(() => {
    const checkConfig = async () => {
      try {
        const { CloudflareAccessService } = await import('../services/cloudflareAuthService');
        const config = CloudflareAccessService.getConfigFromEnv();
        
        setDebugInfo({
          hasConfig: !!config,
          domain: config?.domain,
          aud: config?.applicationAUD ? `${config.applicationAUD.substring(0, 10)}...` : null,
          authMode: 'cloudflare', // Hardcoded for browser
          nodeEnv: 'development' // Hardcoded for browser
        });

        if (!config) {
          setConfigError('Cloudflare Access configuration not found in environment variables');
        }
      } catch (error) {
        setConfigError(`Configuration check failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    checkConfig();
  }, []);

  const handleTestLogin = async () => {
    try {
      console.log('Testing login with debug info:', debugInfo);
      
      // Try to get config and redirect
      const { CloudflareAccessService } = await import('../services/cloudflareAuthService');
      const config = CloudflareAccessService.getConfigFromEnv();
      
      if (!config) {
        alert('Cloudflare Access not configured. Check environment variables.');
        return;
      }

      const loginUrl = `https://${config.domain}/cdn-cgi/access/login`;
      console.log('Attempting to redirect to:', loginUrl);
      
      // Test if we can reach the login URL first
      try {
        const response = await fetch(loginUrl, { method: 'HEAD', mode: 'no-cors' });
        console.log('Login URL test:', response);
      } catch (fetchError) {
        console.log('Login URL fetch test failed (expected for CORS):', fetchError);
      }
      
      // Attempt redirect
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Login test failed:', error);
      alert(`Login failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleMockLogin = () => {
    // Always allow mock login in development
    import('../services/cloudflareAuthService').then(({ CloudflareAccessService }) => {
      CloudflareAccessService.mockAuthenticatedUser({
        id: 'samuel@lgger.com',
        email: 'samuel@lgger.com',
        name: 'Samuel (Test User)',
        groups: ['admin']
      });
      
      // Reload the page to trigger re-authentication
      window.location.reload();
    });
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

  // Not authenticated - show debug login screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full mx-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">MustardTree Partners</h1>
          <h2 className="text-lg font-semibold text-gray-700 mb-6">Blog Admin Access (Debug Mode)</h2>
          
          {/* Configuration Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Configuration Status:</h3>
            {debugInfo && (
              <div className="space-y-1 text-sm">
                <div>Has Config: <span className={debugInfo.hasConfig ? 'text-green-600' : 'text-red-600'}>{debugInfo.hasConfig ? 'Yes' : 'No'}</span></div>
                <div>Domain: <span className="font-mono text-gray-700">{debugInfo.domain || 'Not set'}</span></div>
                <div>AUD: <span className="font-mono text-gray-700">{debugInfo.aud || 'Not set'}</span></div>
                <div>Auth Mode: <span className="font-mono text-gray-700">{debugInfo.authMode || 'Not set'}</span></div>
                <div>Node Env: <span className="font-mono text-gray-700">{debugInfo.nodeEnv || 'Not set'}</span></div>
              </div>
            )}
            {configError && (
              <div className="mt-2 text-red-600 text-sm flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {configError}
              </div>
            )}
          </div>

          <p className="text-gray-600 mb-4">
            This blog admin area is protected by Cloudflare Access. 
            Choose an option below to authenticate.
          </p>

          {/* Development Mode Warning */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Development Mode Notice:</p>
                <p>You're running on localhost. The "Test Cloudflare Access Login" will fail because Cloudflare Access requires proper domain configuration. Use "Mock Login" for local development.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Recommended for development */}
            <button
              onClick={handleMockLogin}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 border-2 border-green-700"
            >
              <User className="h-5 w-5" />
              <span>✅ Use Mock Login (Development)</span>
            </button>

            {/* Will fail on localhost */}
            <button
              onClick={handleTestLogin}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 opacity-75"
              title="This will fail on localhost - only works when deployed to production domain"
            >
              <LogIn className="h-5 w-5" />
              <span>⚠️ Test Cloudflare Access Login (Production Only)</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Debug mode - shows configuration status and provides testing options
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};