# Cloudflare Setup Script

## Prerequisites Setup

### 1. Install Node.js (if not already installed)
1. Download Node.js from https://nodejs.org/
2. Install the LTS version (20.x recommended)
3. Verify installation: `node --version` and `npm --version`

### 2. Install Wrangler CLI
```bash
npm install -g wrangler
```

## Cloudflare Account Setup

### Step 1: Authenticate with Cloudflare
```bash
wrangler auth login
```
This will open your browser and prompt you to log in to Cloudflare.

### Step 2: Get Your Account ID
1. Go to https://dash.cloudflare.com
2. Select your domain (mustardtreegroup.com)
3. In the right sidebar, copy your "Account ID"
4. Save this for environment variables

## R2 Storage Setup

### Step 3: Create R2 Bucket
```bash
# Create the main document storage bucket
wrangler r2 bucket create mustardtree-documents

# Create backup bucket (optional but recommended)
wrangler r2 bucket create mustardtree-documents-backup
```

### Step 4: Configure R2 CORS
```bash
# Apply CORS configuration from the cors.json file
wrangler r2 bucket cors set mustardtree-documents cors.json
```

### Step 5: Create R2 API Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "R2 Token" template or create custom with:
   - **Permissions**: `Cloudflare R2:Edit`
   - **Account Resources**: Include your account
   - **Zone Resources**: Include all zones (or specific zone)
4. Click "Continue to summary" then "Create Token"
5. **IMPORTANT**: Copy and save the Access Key ID and Secret Access Key

## Cloudflare Access Setup

### Step 6: Enable Zero Trust
1. Go to https://one.dash.cloudflare.com/
2. If first time, set up Zero Trust for your account
3. Choose a team name (e.g., "mustardtree-partners")

### Step 7: Create Access Applications

#### Customer Portal Application
1. Go to Zero Trust → Access → Applications
2. Click "Add an application" → "Self-hosted"
3. Configure:
   - **Application name**: Customer Portal
   - **Subdomain**: portal
   - **Domain**: mustardtreegroup.com (or your domain)
   - **Path**: /portal
   - **Session Duration**: 24 hours
4. Click "Next"
5. Add a policy:
   - **Policy name**: Customer Access
   - **Action**: Allow
   - **Configure rules**: Include → Emails → (add customer emails)
   - Or create an Access Group for customers
6. Click "Next" then "Add application"
7. **IMPORTANT**: Copy the "Application Audience (AUD) Tag" from the Overview tab

#### Admin Portal Application
1. Create another application:
   - **Application name**: Admin Portal
   - **Subdomain**: admin (or use main domain)
   - **Domain**: mustardtreegroup.com
   - **Path**: /admin
   - **Session Duration**: 8 hours
2. Add policies for staff and admin access:
   - **Staff Policy**: Include emails for staff members
   - **Admin Policy**: Include emails for administrators

### Step 8: Create Access Groups (Recommended)
1. Go to Zero Trust → My Team → Groups
2. Create groups:
   - **Name**: customers
   - **Criteria**: Include → Emails ending in → @yourcustomer.com (or specific emails)
   
   - **Name**: staff  
   - **Criteria**: Include → Emails → staff@mustardtreegroup.com, employee@mustardtreegroup.com
   
   - **Name**: admins
   - **Criteria**: Include → Emails → admin@mustardtreegroup.com

3. Update your application policies to use these groups instead of individual emails

## DNS Configuration

### Step 9: Add DNS Records
1. Go to https://dash.cloudflare.com → Your Domain → DNS
2. Add CNAME records:
   ```
   Type: CNAME
   Name: portal
   Target: mustardtree-web.pages.dev (will be created in next step)
   
   Type: CNAME
   Name: admin  
   Target: mustardtree-web.pages.dev
   ```

## Pages Deployment

### Step 10: Build and Deploy
```bash
# Navigate to your project directory
cd /path/to/Mustardtree-Partners-web

# Install dependencies
npm install

# Build the project
npm run build

# Create Pages project (first time only)
wrangler pages project create mustardtree-web --compatibility-date=2024-11-05

# Deploy to Pages
wrangler pages deploy dist --project-name=mustardtree-web
```

### Step 11: Configure Environment Variables
1. Go to https://dash.cloudflare.com → Pages → mustardtree-web
2. Go to Settings → Environment variables
3. Add these production variables:

```env
VITE_CLOUDFLARE_ACCOUNT_ID=your_account_id_here
VITE_CLOUDFLARE_ACCESS_APPLICATION_AUD=your_customer_portal_aud_tag
VITE_DOMAIN=mustardtreegroup.com
VITE_R2_BUCKET_NAME=mustardtree-documents
VITE_R2_ACCESS_KEY_ID=your_r2_access_key_id
VITE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
NODE_ENV=production
VITE_MAX_FILE_SIZE=104857600
VITE_ENABLE_AUDIT_LOGGING=true
VITE_SESSION_TIMEOUT=480
```

4. Click "Save" and trigger a new deployment

## Verification Steps

### Step 12: Test the Setup
1. **Test Customer Portal**:
   - Visit https://portal.mustardtreegroup.com/portal
   - You should be redirected to Cloudflare Access login
   - After authentication, you should see the customer portal

2. **Test Admin Portal**:
   - Visit https://admin.mustardtreegroup.com/admin/documents
   - Authenticate as admin user
   - You should see the document management interface

3. **Test R2 Storage**:
   - Try uploading a document through the portal
   - Check the R2 bucket in Cloudflare dashboard to verify files are stored

## Troubleshooting

### Common Issues:
1. **Authentication fails**: Check AUD tag matches environment variable
2. **File uploads fail**: Verify R2 credentials and CORS configuration  
3. **Access denied**: Review Access policies and user groups
4. **DNS not resolving**: Wait for DNS propagation (up to 24 hours)

### Debug Commands:
```bash
# Check R2 buckets
wrangler r2 bucket list

# View CORS config
wrangler r2 bucket cors list mustardtree-documents

# Check Pages deployments
wrangler pages deployment list --project-name=mustardtree-web

# View deployment logs
wrangler pages deployment tail --project-name=mustardtree-web
```

## Security Notes

### Important Security Considerations:
1. **Never commit R2 credentials** to version control
2. **Use least-privilege access** for R2 tokens
3. **Regularly rotate API keys** (recommended: every 90 days)
4. **Monitor Access logs** for suspicious activity
5. **Set up alerts** for failed authentication attempts
6. **Review user access** monthly and remove inactive users

### Access Control Best Practices:
1. Use Access Groups instead of individual email rules
2. Set appropriate session durations (shorter for admins)
3. Enable require fresh authentication for sensitive operations
4. Consider adding device trust policies for admin access
5. Set up geographic restrictions if needed

## Next Steps After Setup

1. **Create initial customer accounts** in the admin panel
2. **Upload test documents** to verify functionality
3. **Train staff** on document management features
4. **Set up monitoring** and alerting
5. **Plan regular security reviews**

## Support Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/
- **R2 Documentation**: https://developers.cloudflare.com/r2/
- **Access Documentation**: https://developers.cloudflare.com/cloudflare-one/
- **Wrangler CLI Docs**: https://developers.cloudflare.com/workers/wrangler/