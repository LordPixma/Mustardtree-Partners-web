import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useCloudflareAuth } from "./services/cloudflareAuthService";
import { Loader2 } from "lucide-react";

// Lazy-loaded routes for code splitting
const Privacy = React.lazy(() => import("./components/Privacy").then(m => ({ default: m.Privacy })));
const Terms = React.lazy(() => import("./components/Terms").then(m => ({ default: m.Terms })));
const Blog = React.lazy(() => import("./components/Blog").then(m => ({ default: m.Blog })));
const BlogPost = React.lazy(() => import("./components/BlogPost").then(m => ({ default: m.BlogPost })));
const GisServices = React.lazy(() => import("./components/GisServices").then(m => ({ default: m.GisServices })));
const CustomerPortal = React.lazy(() => import("./components/CustomerPortal").then(m => ({ default: m.CustomerPortal })));
const AdminLayout = React.lazy(() => import("./components/AdminRouter").then(m => ({ default: m.AdminLayout })));
const NotFound = React.lazy(() => import("./components/NotFound").then(m => ({ default: m.NotFound })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Protected route for customer portal - requires authentication
 * In development mode, allows access for testing
 */
const PortalRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, isAuthenticated, hasCustomerAccess, hasAdminAccess, hasStaffAccess } = useCloudflareAuth();
  const isDev = import.meta.env.DEV;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isDev && !isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

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
        <Suspense fallback={<PageLoader />}>
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

            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
