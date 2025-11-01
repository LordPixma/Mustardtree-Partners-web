import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DevelopmentLogin } from './CloudflareLogin';
import { DebugCloudflareLogin } from './DebugCloudflareLogin';
import { AdminDashboard } from './AdminDashboard';
import { useCloudflareAuth } from '../services/cloudflareAuthService';
import { Loader2 } from 'lucide-react';

/**
 * Protected route component that requires Cloudflare Access authentication
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, isAuthenticated, hasAdminAccess } = useCloudflareAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !hasAdminAccess) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Admin router with Cloudflare Access authentication
 */
export const AdminRouter: React.FC = () => {
  const [isDevMode] = React.useState(() => {
    return process.env.NODE_ENV === 'development' && process.env.DEV_MOCK_AUTH === 'true';
  });

  return (
    <Routes>
      {/* Login route */}
      <Route 
        path="/login" 
        element={
          isDevMode ? (
            <DevelopmentLogin onAuthSuccess={() => window.location.href = '/admin'} />
          ) : (
            <DebugCloudflareLogin onAuthSuccess={() => window.location.href = '/admin'} />
          )
        } 
      />
      
      {/* Protected admin routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirect any other admin paths to dashboard */}
      <Route path="/*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

/**
 * Admin layout wrapper that initializes Cloudflare Access
 */
export const AdminLayout: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    // Initialize Cloudflare Access service
    const initializeAuth = async () => {
      try {
        const { CloudflareAccessService } = await import('../services/cloudflareAuthService');
        
        // Get configuration from environment
        const config = CloudflareAccessService.getConfigFromEnv();
        
        if (config) {
          CloudflareAccessService.initialize(config);
          console.log('Cloudflare Access initialized successfully');
        } else {
          console.warn('Cloudflare Access configuration not found - check environment variables');
        }
      } catch (error) {
        console.error('Failed to initialize Cloudflare Access:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return <AdminRouter />;
};

/**
 * Hook to check if current page requires admin authentication
 */
export const useAdminAuth = () => {
  const { user, isLoading, isAuthenticated, hasAdminAccess, logout } = useCloudflareAuth();
  
  return {
    user,
    isLoading,
    isAuthenticated,
    hasAdminAccess,
    logout,
    requiresAuth: true // Admin always requires auth
  };
};