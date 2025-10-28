## Purpose

This file gives focused, practical instructions for AI coding agents working on the Mustardtree-Partners-web repo. Only include project-discoverable rules and examples that make an agent productive immediately.

## Quick facts

- Tech stack: Vite + React (TypeScript), Tailwind CSS, Framer Motion, lucide-react icons.
- Run locally: `npm install` then `npm run dev` (see `package.json` scripts).
- Build: `npm run build`. Lint: `npm run lint`.

## Key files and where to start

- `src/index.tsx` — app entry. Currently renders `<App />` directly.
- `src/App.tsx` — top-level composition: renders site sections (Navbar, Hero, About, Services, WhyChooseUs, Contact, Footer).
- `src/AppRouter.tsx` — router wrapper using `react-router-dom`. NOTE: not wired in `index.tsx` by default.
- `src/components/` — page sections and shared UI (Navbar.tsx, Hero.tsx, About.tsx, Services.tsx, WhyChooseUs.tsx, Contact.tsx, Footer.tsx).
- `src/lib/utils.ts` — `cn(...inputs)` helper that composes classes using `clsx` + `twMerge`. Prefer `cn()` for Tailwind class merging.
- `public/` — static assets. Example: `/mustardtree_300.png` referenced by `Navbar.tsx`.

## Project-specific conventions and idioms

- Section navigation uses element ids + smooth scroll. Example: `Navbar.tsx` defines a `navLinks` array of `{ name, id }` and `scrollToSection(id)` which calls `document.getElementById(id).scrollIntoView({ behavior: 'smooth' })`. When adding a new nav link, add the id to the target section component (`<section id="your-id">`).
- Class composition: use the `cn()` function from `src/lib/utils.ts` instead of manual string concatenation to avoid conflicting Tailwind classes. Example: `className={cn('px-4', condition && 'text-white')}`.
- Animations: entry/scroll animations use `framer-motion` (see `Hero.tsx`). Follow the same pattern of `initial`, `animate`, `transition` props when adding animated sections.
- Responsive patterns: prefer Tailwind breakpoints and utility-first composition. Desktop navigation is in `md:flex` while mobile uses `md:hidden` + a toggled menu in `Navbar.tsx`.

## Routing & pages

- The project has `react-router-dom` installed and `src/AppRouter.tsx` is the router wrapper. If you need route-based pages (instead of a single scrolling page), do one of the following:
  - Replace render in `src/index.tsx` with `<AppRouter />` and add route elements in `AppRouter.tsx`.
  - Or add new route components and import them into `AppRouter.tsx`. Keep `App.tsx` as the site shell for single-page behavior.

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

- Wire routing (switch to route-based pages):

  1. In `src/index.tsx` render `<AppRouter />` instead of `<App />`.
  2. Add a `<Route path="/new" element={<NewPage />} />` inside `src/AppRouter.tsx`.

## What not to assume

- The repo was scaffolded from a visual template (see `README.md`). Some files (like `AppRouter.tsx`) may be present but unused; confirm by checking `src/index.tsx` before changing global wiring.
- There are currently no tests — do not add test-related changes without discussing scope.

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
