import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./App";
import { Privacy } from "./components/Privacy";
import { Terms } from "./components/Terms";
import { Blog } from "./components/Blog";
import { BlogPost } from "./components/BlogPost";
import { AdminLayout } from "./components/AdminRouter";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CustomerPortal } from "./components/CustomerPortal";
import { AdminDocumentManagement } from "./components/AdminDocumentManagement";
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
          
          {/* Customer Portal - Protected by Cloudflare Access */}
          <Route path="/portal" element={<CustomerPortal />} />
          
          {/* Admin routes with Cloudflare Access authentication */}
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}