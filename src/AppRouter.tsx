import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useCloudflareAuth, CloudflareAccessService } from "./services/cloudflareAuthService";
import { Loader2, Shield, LogIn, FileText } from "lucide-react";

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
 * Portal login gate - shown when user is not authenticated
 */
function PortalLoginGate() {
  const handleLogin = () => {
    CloudflareAccessService.login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Customer Document Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Access your documents securely. Please sign in with your authorized account to continue.
          </p>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <Shield className="w-3 h-3" />
            Protected by Cloudflare Zero Trust
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-400">
          Don't have an account?{' '}
          <a href="/#contact" className="text-yellow-500 hover:text-yellow-400 font-medium">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Protected route for customer portal - always requires authentication
 */
const PortalRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, isAuthenticated, hasCustomerAccess, hasAdminAccess, hasStaffAccess } = useCloudflareAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <PortalLoginGate />;
  }

  if (!hasCustomerAccess && !hasAdminAccess && !hasStaffAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Your account does not have permission to access the document portal.</p>
          <a href="/" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block">
            Back to Home
          </a>
        </div>
      </div>
    );
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
