# Environment Variables Setup Guide

This document outlines the environment variables needed for the customer document portal to function properly.

## Required Environment Variables

### Cloudflare Configuration

1. **VITE_CLOUDFLARE_ACCOUNT_ID** ✅
   - Value: `1e54c42267499cd9093c467c8b5517d1`
   - Status: Configured in Cloudflare Pages

2. **VITE_R2_BUCKET_NAME** ✅
   - Value: `mustardtree-documents`
   - Status: Configured in Cloudflare Pages

3. **VITE_R2_ACCESS_KEY_ID** ⚠️
   - Status: Needs to be created via Cloudflare Dashboard
   - Instructions: Go to Cloudflare Dashboard → R2 → Manage R2 API tokens → Create API token

4. **VITE_R2_SECRET_ACCESS_KEY** ⚠️
   - Status: Needs to be created via Cloudflare Dashboard
   - Instructions: Created alongside the access key ID

## Setting Up R2 API Credentials

### Step 1: Create R2 API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 Object Storage
3. Click "Manage R2 API tokens"
4. Click "Create API token"
5. Configure the token:
   - **Token name**: `mustardtree-document-portal`
   - **Permissions**: 
     - Account: `Cloudflare R2:Edit`
   - **Account resources**: Include your account
   - **Zone resources**: Include all zones (or specific if preferred)

### Step 2: Add Credentials to Cloudflare Pages

Once you have the API token credentials:

```bash
# Set the access key ID
npx wrangler pages secret put VITE_R2_ACCESS_KEY_ID --project-name mustardtree-web

# Set the secret access key
npx wrangler pages secret put VITE_R2_SECRET_ACCESS_KEY --project-name mustardtree-web
```

## CORS Configuration

The R2 bucket needs CORS configuration for browser uploads. This can be done via:

### Option 1: Cloudflare Dashboard
1. Go to R2 → mustardtree-documents bucket → Settings → CORS policy
2. Add the following configuration:

```json
[
  {
    "AllowedOrigins": [
      "https://mustardtree-web.pages.dev",
      "https://mustardtreegroup.com",
      "http://localhost:5173"
    ],
    "AllowedMethods": [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### Option 2: Wrangler CLI (if fixed)
```bash
npx wrangler r2 bucket cors set mustardtree-documents --file cors.json
```

## Verification

After setting up all environment variables, redeploy the application:

```bash
npm run build
npx wrangler pages deploy dist --project-name mustardtree-web
```

## Current Status

- ✅ Cloudflare Pages project deployed
- ✅ R2 bucket created and accessible
- ✅ Basic environment variables configured
- ⚠️ R2 API credentials need manual setup via dashboard
- ⚠️ CORS configuration needs to be set via dashboard

## Next Steps

1. Create R2 API token via Cloudflare Dashboard
2. Add R2 credentials to Pages environment variables
3. Configure CORS policy via R2 bucket settings
4. Redeploy application
5. Test document upload/download functionality