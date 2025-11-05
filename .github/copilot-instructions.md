## Purpose

This file gives focused, practical instructions for AI coding agents working on the Mustardtree-Partners-web repo. Only include project-discoverable rules and examples that make an agent productive immediately.

## Quick facts

- Tech stack: Vite + React (TypeScript), Tailwind CSS, Framer Motion, lucide-react icons.
- Authentication: **Cloudflare Access** (Zero Trust) for production admin access.
- Run locally: `npm install` then `npm run dev` (see `package.json` scripts).
- Build: `npm run build`. Lint: `npm run lint`.

## Key files and where to start

- `src/index.tsx` — app entry. **Currently renders `<AppRouter />`** (router is now active).
- `src/AppRouter.tsx` — main router with routes: `/`, `/privacy`, `/terms`, `/blog`, `/blog/:slug`, `/portal`, `/admin/*`.
- `src/App.tsx` — single-page layout: renders site sections (Navbar, Hero, About, Services, WhyChooseUs, Contact, Footer).
- `src/components/AdminRouter.tsx` — protected admin routes using Cloudflare Access authentication.
- `src/components/CustomerPortal.tsx` — customer-facing document portal with upload/download capabilities.
- `src/components/AdminDocumentManagement.tsx` — staff interface for managing customer documents.
- `src/services/cloudflareAuthService.ts` — Cloudflare Access JWT verification and user management with role-based access.
- `src/services/documentService.ts` — document CRUD operations with Cloudflare R2 integration and version control.
- `src/services/blogService.ts` — blog CRUD operations with localStorage (ready for backend migration).
- `src/types/documents.ts` — TypeScript interfaces for document management system.
- `src/lib/utils.ts` — `cn(...inputs)` helper that composes classes using `clsx` + `twMerge`. Prefer `cn()` for Tailwind class merging.
- `public/` — static assets with Cloudflare Pages config (`_headers`, `_redirects`).
- `docs/CUSTOMER-PORTAL-SETUP.md` — comprehensive setup guide for document portal.
- `docs/DEPLOYMENT-GUIDE.md` — step-by-step deployment instructions.

## Project-specific conventions and idioms

- **Authentication**: Production uses Cloudflare Access JWT verification with role-based access (admin, staff, customer). No password management required.
- **Document management**: `documentService.ts` integrates with Cloudflare R2 for storage, includes version control, audit logging, and permission management.
- **Data layer**: Services use localStorage for development/demo with sanitized inputs. Production ready for backend API integration.
- **Role-based access**: Three user roles (admin, staff, customer) with different permissions. Use `hasAdminAccess`, `hasStaffAccess`, `hasCustomerAccess` checks.
- **File handling**: 100MB upload limit, MIME type validation, automatic version control, and secure R2 storage with presigned URLs.
- **Section navigation**: element ids + smooth scroll. `Navbar.tsx` defines `navLinks` array, `scrollToSection(id)` calls `document.getElementById(id).scrollIntoView({ behavior: 'smooth' })`.
- **Class composition**: use `cn()` from `src/lib/utils.ts` for Tailwind class merging. Example: `className={cn('px-4', condition && 'text-white')}`.
- **Animations**: `framer-motion` with `initial`, `animate`, `transition` pattern (see `Hero.tsx`).
- **Type safety**: All data uses TypeScript interfaces from `src/types/`. Document routes require proper role validation.

## Routing & pages

- **Active routing**: `src/index.tsx` renders `<AppRouter />`. Routes: `/` (single-page site), `/blog`, `/blog/:slug`, `/portal` (customer documents), `/admin/*` (staff/admin).
- **Customer portal**: `/portal` route serves `<CustomerPortal />` with role-based document access, upload/download, and version history.
- **Admin routes**: `/admin/*` wrapped in `<AdminLayout />` with Cloudflare Access. Includes `/admin/documents` for customer document management.
- **Authentication flow**: Cloudflare Access → JWT verification → role assignment → route access. Three roles: admin, staff, customer.
- **Blog system**: Dynamic routing with slug-based URLs. Posts use `generateSlug()` helper in `blogService.ts`.
- **Error boundaries**: `<ErrorBoundary />` wraps the entire app to catch route and component errors.

## Assets & public files

- Put static images and icons in `public/` and reference them by absolute path (e.g. `/mustardtree_300.png`). `Navbar.tsx` demonstrates this.

## Build, lint and common workflows

- Install: `npm install`.
- Dev server: `npm run dev` (Vite). Preview production build: `npm run preview` after `npm run build`.
- Lint: `npm run lint` (ESLint + TypeScript). There are no test scripts in `package.json`.
- Deploy: Automatic deployment to Cloudflare Pages via GitHub Actions on push to `main`.

## Small examples (copy-paste friendly)

- Add a nav link (edit `src/components/Navbar.tsx`):

  navLinks = [{ name: 'New', id: 'new-section' }, ...];

  Add target section in `src/components/NewSection.tsx`: `<section id="new-section">...</section>` and include `<NewSection />` in `App.tsx` where appropriate.

- Add a new route (edit `src/AppRouter.tsx`):

  ```tsx
  <Route path="/new-page" element={<NewPage />} />
  ```

- Create blog content (in admin dashboard or via `blogService.ts`):

  ```tsx
  await blogService.createPost({
    title: "New Post",
    content: "Markdown content here",
    excerpt: "Brief summary",
    authorId: "1",
    status: "published",
    seo: { metaTitle: "SEO title", metaDescription: "SEO description", keywords: [] }
  });
  ```

## What not to assume

- The repo was scaffolded from a visual template (see `README.md`). The routing system is now fully active (`AppRouter` is wired in `index.tsx`).
- There are currently no tests — do not add test-related changes without discussing scope.
- **Security**: Admin authentication is production-ready via Cloudflare Access. Never bypass `hasAdminAccess` checks or authentication guards.

## When editing code, prefer small, focused PRs

- Keep changes localized: update a single component or small feature per PR.
- Include the `npm run lint` check and confirm the dev server runs for your change.

## Deployment & Production

- The project is configured for Cloudflare Pages deployment with GitHub Actions.
- Production builds are automatically deployed when pushing to `main` branch.
- PR deployments create preview environments for testing.
- Static assets are cached for 1 year, security headers are applied via `public/_headers`.
- SPA routing is handled via `public/_redirects` (all routes serve `index.html`).

If anything here is unclear or you want more examples (e.g., adding a new page component with route + navigation + animation), tell me which scenario and I will extend these instructions.
