import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { App } from "./App";
import { Privacy } from "./components/Privacy";
import { Terms } from "./components/Terms";
import { Blog } from "./components/Blog";
import { BlogPost } from "./components/BlogPost";
import { GisServices } from "./components/GisServices";
import { AdminLayout } from "./components/AdminRouter";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CustomerPortal } from "./components/CustomerPortal";
import { useCloudflareAuth } from "./services/cloudflareAuthService";
import { Loader2 } from "lucide-react";

/**
 * Protected route for customer portal - requires authentication
 * In development mode, allows access for testing
 */
const PortalRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, isAuthenticated, hasCustomerAccess, hasAdminAccess, hasStaffAccess } = useCloudflareAuth();
  const isDev = import.meta.env.DEV;

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

  // In production, require real authentication
  if (!isDev && !isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // In production, require appropriate role
  if (!isDev && isAuthenticated && !hasCustomerAccess && !hasAdminAccess && !hasStaffAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export function AppRouter() {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/services/gis" element={<GisServices />} />

          {/* Customer Portal - Protected by authentication */}
          <Route path="/portal" element={
            <PortalRoute>
              <CustomerPortal />
            </PortalRoute>
          } />

          {/* Admin routes with Cloudflare Access authentication */}
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}