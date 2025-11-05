# 🔧 Fix R2 Configuration - Step by Step Guide

The deployment is now updated with the React 18 fixes and proper environment variable handling, but you still need to create the R2 API credentials to enable document storage.

## Current Status ✅
- ✅ React 18 createRoot API implemented
- ✅ React Router future flags added  
- ✅ Environment variables properly configured for Vite
- ✅ Application deployed: https://2b4e3fcc.mustardtree-web.pages.dev

## Missing: R2 API Credentials ⚠️

The message "R2 configuration incomplete" appears because the R2 API credentials haven't been created yet.

## Step-by-Step Fix (5 minutes)

### Step 1: Create R2 API Token (Updated Process)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2 Object Storage** → **Overview**
3. Click **"Manage"** in the **API tokens** section
4. Choose one of two options:
   - **Create Account API token** (recommended for production - tied to account)
   - **Create User API token** (tied to your user account)
5. Under **Permissions**, select:
   - **Admin Read & Write** (for full bucket and object management)
   - OR **Object Read & Write** (if you want to scope to specific buckets)
6. If you selected Object permissions, you can scope to specific buckets or leave it for all buckets
7. Click **"Create Account API token"** or **"Create User API token"**
8. **CRITICAL**: Copy both values immediately (you won't see the Secret Access Key again):
   - **Access Key ID**: `tgOr45sROya-9PPCf0UQIOFiyF9rSb6q6RcZL77u` ✅ (You provided this)
   - **Secret Access Key**: A separate longer string that was displayed alongside the Access Key ID

**Important Note**: The documentation states "*These may often be referred to as Client Secret and Client ID, respectively*" - so if you saw a "Client ID" and "Client Secret", those are the Access Key ID and Secret Access Key.

### Step 2: Add Credentials to Cloudflare Pages
Run these commands in your terminal, entering the credentials when prompted:

```bash
# Add the Access Key ID
npx wrangler pages secret put VITE_R2_ACCESS_KEY_ID --project-name mustardtree-web

# Add the Secret Access Key  
npx wrangler pages secret put VITE_R2_SECRET_ACCESS_KEY --project-name mustardtree-web
```

When prompted, paste the values you copied from Step 1.

### Step 3: Verify Environment Variables
Check that all variables are set:
```bash
npx wrangler pages secret list --project-name mustardtree-web
```

You should see:
- VITE_CLOUDFLARE_ACCOUNT_ID ✅
- VITE_R2_BUCKET_NAME ✅
- VITE_R2_ACCESS_KEY_ID (to be added)
- VITE_R2_SECRET_ACCESS_KEY (to be added)

### Step 4: Test the Application
1. Open: https://2b4e3fcc.mustardtree-web.pages.dev
2. Check browser console - the "R2 configuration incomplete" message should be gone
3. Navigate to `/portal` to test the customer portal
4. Navigate to `/admin` to test the admin interface

## Next Steps After R2 Setup ✅
1. **Configure CORS** - Add the CORS policy from `cors.json` to your R2 bucket via dashboard
2. **Set up Cloudflare Access** - Configure authentication policies for production
3. **Test document upload/download** - Full functionality should work

## If You Need Help
- **Error "Access denied"**: Check that the API token permissions include R2:Edit
- **Error "Invalid credentials"**: Verify you copied the Access Key ID and Secret correctly
- **Environment variables not updating**: Redeploy after adding credentials:
  ```bash
  npm run build
  npx wrangler pages deploy dist --project-name mustardtree-web
  ```

## Security Note 🔒
The R2 credentials will only be visible during token creation. Store them securely and never commit them to version control.