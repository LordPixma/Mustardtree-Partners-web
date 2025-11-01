# MustardTree Partners Documentation

This folder contains all technical documentation for the MustardTree Partners website.

## 📖 Documentation Index

### Setup & Configuration
- [**Cloudflare Access Setup**](./CLOUDFLARE-ACCESS-SETUP.md) - Complete guide for configuring Cloudflare Access authentication
- [**Cloudflare Access Implementation**](./CLOUDFLARE-ACCESS-IMPLEMENTATION.md) - Technical implementation details
- [**Domain Configuration Fix**](./DOMAIN-CONFIGURATION-FIX.md) - Resolving domain configuration issues

### Migration & Security
- [**Migration Checklist**](./MIGRATION-CHECKLIST.md) - Steps for migrating from legacy authentication
- [**Production Security**](./PRODUCTION-SECURITY.md) - Security considerations and best practices
- [**Security Status**](./SECURITY-STATUS.md) - Current security implementation status

### Production

- Build: `npm run build`
- Preview: `npm run preview` (serves the built files locally)
- Lint: `npm run lint`

## Deployment

This project is configured for automatic deployment to Cloudflare Pages via GitHub Actions.

### Setup Cloudflare Pages Deployment

1. **Create a Cloudflare Pages project:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
   - Create a new project connected to this GitHub repository
   - Set build command: `npm run build`
   - Set build output directory: `dist`

2. **Configure GitHub Secrets:**
   - `CLOUDFLARE_API_TOKEN`: Create an API token with "Cloudflare Pages:Edit" permissions
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID (found in dashboard sidebar)

3. **Deploy:**
   - Push to `main` branch triggers production deployment
   - Pull requests trigger preview deployments

### Manual Deployment

You can also deploy manually using Wrangler:

```bash
npm install -g wrangler
wrangler login
npm run build
wrangler pages deploy dist --project-name=mustardtree-web
```

## Project Structure

- `src/App.tsx` - Main app component with all page sections
- `src/components/` - Individual page sections (Hero, About, Services, etc.)
- `src/lib/utils.ts` - Utility functions including `cn()` for class merging
- `public/` - Static assets
- `.github/workflows/deploy.yml` - Automated deployment workflow
