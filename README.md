# MustardTree Partners — Website

Marketing site and client portal for **Mustardtree Partners Ltd**, a UK
business advisory and corporate services firm. Built with React, TypeScript,
Tailwind CSS, and Framer Motion, deployed on Cloudflare Pages with a Cloudflare
Worker API backend.

## Tech stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (refined navy/gold/ivory brand palette) + Framer Motion
- **Routing:** React Router
- **SEO:** `react-helmet-async` per-route metadata + build-time prerendering (`scripts/prerender.mjs`), JSON-LD, sitemap, robots
- **Backend:** Cloudflare Worker (`worker/`) — contact email, document portal, blog API
- **Auth:** Cloudflare Access (Zero Trust) for `/portal` and `/admin`
- **Deployment:** Cloudflare Pages via GitHub Actions on push to `main`

## Quick start

```bash
npm install        # install dependencies
npm run dev        # start dev server → http://localhost:5173
npm run build      # production build + prerender
npm run preview    # serve the production build locally
npm run lint       # eslint
npm run type-check # tsc --noEmit
```

## Project structure

```
src/
├── App.tsx                 # Homepage composition (Hero → About → Services → …)
├── AppRouter.tsx           # Routes (/, /blog, /services/gis, /portal, /admin)
├── components/             # Page sections and standalone pages
│   ├── Hero / About / Services / Approach / Sectors / WhyChooseUs / Contact / Footer
│   ├── Navbar.tsx          # Navigation + Contact CTA
│   ├── Seo.tsx             # Single source of truth for meta + Organization JSON-LD
│   └── GisServices.tsx     # /services/gis deep-dive (Risk, Cyber & Intelligence practice)
├── services/               # API + Cloudflare auth clients
└── index.css               # Tailwind layers + brand typography
public/                     # Static assets, sitemap.xml, robots.txt, _redirects
scripts/prerender.mjs       # Headless-Chromium prerender of public routes
worker/                     # Cloudflare Worker API
```

## Positioning

The site presents the firm institutionally across four practice areas:

1. **Corporate Services & Governance** — nominee/professional directorship, company secretarial, Companies House filings, statutory compliance, board support
2. **International Expansion & UK Market Entry** — UK subsidiary incorporation, cross-border structuring, local representation
3. **Strategy & Business Advisory** — corporate strategy, operating model, due diligence, transaction support
4. **Risk, Cyber & Intelligence** — cyber/AI governance, identity oversight, business & spatial intelligence (GIS)

## Deployment

Push to `main` triggers a production deploy to Cloudflare Pages
(`.github/workflows/deploy.yml`). Manual deploy:

```bash
npm run build
wrangler pages deploy dist --project-name=mustardtree-web
```

## License

All rights reserved — MustardTree Partners.
