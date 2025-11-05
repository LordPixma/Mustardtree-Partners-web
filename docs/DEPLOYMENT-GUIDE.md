# Customer Portal Deployment Guide

## Prerequisites

1. **Cloudflare Account** with Pro plan or higher (for Access features)
2. **Domain managed by Cloudflare** (e.g., mustardtreegroup.com)
3. **Wrangler CLI** installed globally: `npm install -g wrangler`
4. **Node.js 18+** and **npm**

## Step 1: Setup Cloudflare R2 Storage

### 1.1 Create R2 Bucket

```bash
# Authenticate with Cloudflare
wrangler auth login

# Create the document storage bucket
wrangler r2 bucket create mustardtree-documents

# Set CORS policy for browser uploads
wrangler r2 bucket cors put mustardtree-documents --file cors.json
```

### 1.2 Create R2 API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → My Profile → API Tokens
2. Click "Create Token"
3. Use "R2 Token" template or create custom with:
   - Permissions: `Cloudflare R2:Edit`
   - Account Resources: `Include All accounts`
   - Zone Resources: `Include All zones`
4. Save the Access Key ID and Secret Access Key

## Step 2: Setup Cloudflare Access

### 2.1 Create Access Applications

#### Customer Portal Application
1. Go to Zero Trust → Access → Applications
2. Click "Add an application" → "Self-hosted"
3. Configure:
   - **Application name**: Customer Portal
   - **Subdomain**: `portal`
   - **Domain**: `mustardtreegroup.com`
   - **Path**: `/portal`
   - **Session Duration**: 24 hours

#### Admin Portal Application  
1. Create another application:
   - **Application name**: Admin Portal
   - **Subdomain**: `admin` (or use main domain)
   - **Domain**: `mustardtreegroup.com`
   - **Path**: `/admin`
   - **Session Duration**: 8 hours

### 2.2 Create Access Policies

#### Customer Access Policy
1. In the Customer Portal app, add a policy:
   - **Policy name**: Customer Access
   - **Action**: Allow
   - **Rules**: Include → Emails ending in → `@yourcustomer.com`
   - Or create a group for customers and use "Include → Access Groups"

#### Staff Access Policy
1. In both applications, add policies:
   - **Policy name**: Staff Access
   - **Action**: Allow  
   - **Rules**: Include → Emails → `staff@mustardtreegroup.com`

#### Admin Access Policy
1. **Policy name**: Admin Access
2. **Action**: Allow
3. **Rules**: Include → Emails → `admin@mustardtreegroup.com`

### 2.3 Get Application AUD Tags
1. Go to each application → Overview
2. Copy the "Application Audience (AUD) Tag"
3. Save these for environment variables

## Step 3: Configure DNS

Add subdomain records in Cloudflare DNS:

```
Type: CNAME
Name: portal
Target: mustardtree-web.pages.dev (your Pages URL)

Type: CNAME  
Name: admin
Target: mustardtree-web.pages.dev
```

## Step 4: Deploy to Cloudflare Pages

### 4.1 Create Pages Project

```bash
# Install Wrangler if not already installed
npm install -g wrangler

# Authenticate
wrangler auth login

# Build the project
npm run build

# Create and deploy Pages project
wrangler pages project create mustardtree-web --compatibility-date=2024-11-05
wrangler pages deploy dist --project-name=mustardtree-web
```

### 4.2 Configure Environment Variables

In Cloudflare Pages dashboard (Pages → mustardtree-web → Settings → Environment variables):

#### Production Environment Variables

```env
# Cloudflare Access
VITE_CLOUDFLARE_ACCOUNT_ID=your_account_id_here
VITE_CLOUDFLARE_ACCESS_APPLICATION_AUD=your_customer_portal_aud_tag
VITE_DOMAIN=mustardtreegroup.com

# Cloudflare R2
VITE_R2_BUCKET_NAME=mustardtree-documents
VITE_R2_ACCESS_KEY_ID=your_r2_access_key_id
VITE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key

# Application Settings
NODE_ENV=production
VITE_MAX_FILE_SIZE=104857600
VITE_ENABLE_AUDIT_LOGGING=true
VITE_SESSION_TIMEOUT=480
```

## Step 5: Setup Access Groups (Recommended)

### 5.1 Create Customer Groups
1. Go to Zero Trust → My Team → Groups
2. Create groups:
   - **customers**: Include emails from customer domains
   - **staff**: Include staff email addresses  
   - **admins**: Include admin email addresses

### 5.2 Update Access Policies
Update your application policies to use groups instead of individual emails:
- **Rule**: Include → Access Groups → `customers`
- **Rule**: Include → Access Groups → `staff` 
- **Rule**: Include → Access Groups → `admins`

## Step 6: Test the Deployment

### 6.1 Test Customer Portal
1. Visit `https://portal.mustardtreegroup.com/portal`
2. Authenticate with Cloudflare Access
3. Verify document viewing/uploading works
4. Check audit logs in admin panel

### 6.2 Test Admin Portal
1. Visit `https://admin.mustardtreegroup.com/admin/documents`
2. Authenticate as admin user
3. Test customer creation
4. Test document management
5. Verify audit logging

## Step 7: Security Verification

### 7.1 Access Control Testing
- [ ] Customers can only see their assigned documents
- [ ] Staff can see all customer documents
- [ ] Admins have full access to all features
- [ ] Unauthenticated users are redirected to login

### 7.2 Document Security Testing
- [ ] Document URLs require authentication
- [ ] File uploads are validated and sanitized
- [ ] Version control works correctly
- [ ] Audit logging captures all actions

## Step 8: Monitoring Setup

### 8.1 Cloudflare Analytics
1. Enable Cloudflare Analytics for your domain
2. Monitor traffic to `/portal` and `/admin` paths
3. Set up alerts for unusual activity

### 8.2 Access Logs
1. Go to Zero Trust → Logs → Access
2. Monitor authentication attempts
3. Set up alerts for failed logins

## Step 9: Backup Configuration

### 9.1 R2 Bucket Backup
```bash
# Create backup bucket
wrangler r2 bucket create mustardtree-documents-backup

# Set up lifecycle policy for automated backups
# (Configure in Cloudflare dashboard)
```

### 9.2 Configuration Backup
Document and backup:
- Access application configurations
- Policy rules and groups
- Environment variables
- DNS settings

## Troubleshooting

### Common Issues

#### 1. Authentication Not Working
- Check AUD tag matches environment variable
- Verify domain configuration in Access app
- Ensure user is in correct Access group

#### 2. File Upload Failures
- Check R2 credentials and permissions
- Verify CORS configuration
- Check file size limits

#### 3. Access Denied Errors
- Verify user roles and permissions
- Check Cloudflare Access policies
- Review audit logs for details

#### 4. Performance Issues
- Enable Cloudflare caching for static assets
- Optimize R2 bucket configuration
- Review file sizes and upload limits

### Debug Commands

```bash
# Check R2 bucket status
wrangler r2 bucket list

# View CORS configuration
wrangler r2 bucket cors list mustardtree-documents

# Check Pages deployment
wrangler pages deployment list --project-name=mustardtree-web

# View Pages logs
wrangler pages deployment tail --project-name=mustardtree-web
```

## Maintenance

### Regular Tasks
- [ ] Monitor storage usage and costs
- [ ] Review access logs for security issues  
- [ ] Update environment variables as needed
- [ ] Test backup and recovery procedures
- [ ] Review and update Access policies

### Monthly Tasks
- [ ] Audit user access and permissions
- [ ] Review document retention policies
- [ ] Check for security updates
- [ ] Monitor performance metrics

### Quarterly Tasks
- [ ] Full security review
- [ ] Backup configuration updates
- [ ] User access review and cleanup
- [ ] Performance optimization review

## Support

For issues with:
- **Cloudflare Access**: Check Zero Trust dashboard and logs
- **R2 Storage**: Review R2 dashboard and API limits
- **Pages Deployment**: Check Pages dashboard and build logs
- **Application Bugs**: Review browser console and network logs

## Next Steps

After successful deployment:
1. Train staff on document management features
2. Onboard initial customers to the portal
3. Set up monitoring and alerting
4. Plan for backend API migration (optional)
5. Implement advanced security features (virus scanning, etc.)