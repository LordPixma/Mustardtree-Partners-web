# Cloudflare Setup Checklist

## ✅ Pre-Setup Checklist

- [ ] Node.js installed (v18+ recommended)
- [ ] npm/yarn package manager available
- [ ] Cloudflare account with Pro plan or higher
- [ ] Domain managed by Cloudflare (mustardtreegroup.com)
- [ ] Access to domain DNS settings

## ✅ Installation & Authentication

- [ ] Install Wrangler CLI: `npm install -g wrangler`
- [ ] Authenticate with Cloudflare: `wrangler auth login`
- [ ] Note down Account ID from Cloudflare dashboard

## ✅ R2 Storage Setup

- [ ] Create R2 bucket: `wrangler r2 bucket create mustardtree-documents`
- [ ] Apply CORS config: `wrangler r2 bucket cors set mustardtree-documents cors.json`
- [ ] Create R2 API token with R2:Edit permissions
- [ ] Save Access Key ID and Secret Access Key securely

## ✅ Cloudflare Access Setup

### Zero Trust Setup
- [ ] Enable Zero Trust in Cloudflare dashboard
- [ ] Set team name (e.g., "mustardtree-partners")

### Access Groups (Recommended)
- [ ] Create "customers" group with customer email criteria
- [ ] Create "staff" group with staff email addresses
- [ ] Create "admins" group with admin email addresses

### Customer Portal Application
- [ ] Create self-hosted application
- [ ] Set subdomain: `portal`
- [ ] Set domain: `mustardtreegroup.com`
- [ ] Set path: `/portal`
- [ ] Add customer access policy using groups
- [ ] Copy Application Audience (AUD) tag

### Admin Portal Application
- [ ] Create self-hosted application
- [ ] Set subdomain: `admin` (or use main domain)
- [ ] Set path: `/admin`
- [ ] Add staff and admin access policies
- [ ] Copy Application Audience (AUD) tag

## ✅ DNS Configuration

- [ ] Add CNAME record: `portal` → `mustardtree-web.pages.dev`
- [ ] Add CNAME record: `admin` → `mustardtree-web.pages.dev`
- [ ] Verify DNS propagation (may take up to 24 hours)

## ✅ Pages Deployment

### Build & Deploy
- [ ] Run `npm install` in project directory
- [ ] Run `npm run build` to build the application
- [ ] Create Pages project: `wrangler pages project create mustardtree-web`
- [ ] Deploy: `wrangler pages deploy dist --project-name=mustardtree-web`

### Environment Variables
- [ ] Set `VITE_CLOUDFLARE_ACCOUNT_ID`
- [ ] Set `VITE_CLOUDFLARE_ACCESS_APPLICATION_AUD`
- [ ] Set `VITE_DOMAIN`
- [ ] Set `VITE_R2_BUCKET_NAME`
- [ ] Set `VITE_R2_ACCESS_KEY_ID`
- [ ] Set `VITE_R2_SECRET_ACCESS_KEY`
- [ ] Set `NODE_ENV=production`
- [ ] Set other configuration variables as needed

## ✅ Testing & Verification

### Customer Portal Testing
- [ ] Visit `https://portal.mustardtreegroup.com/portal`
- [ ] Verify Cloudflare Access authentication works
- [ ] Test document viewing (after uploading test documents)
- [ ] Test document upload functionality
- [ ] Verify role-based access (customers can't see admin features)

### Admin Portal Testing
- [ ] Visit `https://admin.mustardtreegroup.com/admin`
- [ ] Authenticate as admin user
- [ ] Test customer creation
- [ ] Test document upload for customers
- [ ] Verify audit log functionality
- [ ] Test document management features

### Technical Testing
- [ ] Check R2 bucket for uploaded files
- [ ] Verify CORS configuration allows browser uploads
- [ ] Test file download functionality
- [ ] Verify version control works correctly
- [ ] Check audit logs are being recorded

## ✅ Security Verification

- [ ] Unauthenticated users redirected to login
- [ ] Customers can only see their own documents
- [ ] Staff can see all customer documents
- [ ] Admins have full access to all features
- [ ] Document URLs require authentication
- [ ] File uploads are validated (size, type)

## ✅ Post-Setup Tasks

### Initial Configuration
- [ ] Create initial customer accounts
- [ ] Upload test documents for each customer
- [ ] Train staff on document management interface
- [ ] Set up document organization (folders, tags)

### Monitoring & Maintenance
- [ ] Set up Cloudflare Analytics for portal domains
- [ ] Configure alerts for failed authentication attempts
- [ ] Schedule regular access reviews
- [ ] Set up automated backups for R2 bucket
- [ ] Document admin procedures for staff

### Security Hardening
- [ ] Review and update Access policies
- [ ] Enable additional security features (device trust, geo-restrictions)
- [ ] Set up monitoring for unusual activity
- [ ] Create incident response procedures
- [ ] Schedule security audits

## 🚨 Emergency Contacts & Recovery

### Important Information to Document
- [ ] Cloudflare account admin contacts
- [ ] R2 API token recovery procedures
- [ ] Emergency access procedures
- [ ] Backup and recovery contact information

### Backup Procedures
- [ ] Regular R2 bucket backups configured
- [ ] Access configuration documented and backed up
- [ ] Environment variables securely stored
- [ ] DNS configuration documented

## 📞 Support & Resources

If you encounter issues:

1. **Check Cloudflare Status**: https://cloudflarestatus.com/
2. **Review Setup Logs**: Use `wrangler` commands to debug
3. **Cloudflare Support**: Available through dashboard for Pro+ accounts
4. **Community**: https://community.cloudflare.com/

## 🎯 Success Criteria

Your setup is complete when:
- ✅ Customers can access portal and manage their documents
- ✅ Staff can manage all customer documents through admin panel
- ✅ All document actions are logged for audit purposes
- ✅ File uploads and downloads work reliably
- ✅ Authentication and authorization work as expected
- ✅ System is secure and follows best practices

---

**⚠️ Important**: Keep your R2 API credentials secure and never commit them to version control. Store them safely and rotate them regularly.