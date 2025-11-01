# 🔐 Cloudflare Access Authentication Setup Guide

## 📋 Overview

This guide walks you through setting up Cloudflare Access as your Identity Provider (IdP) for the MustardTree Partners blog admin area. This replaces the traditional username/password authentication with enterprise-grade security.

## 🌟 Benefits of Cloudflare Access

- **No Password Management**: Use your existing identity providers (Google, Azure AD, etc.)
- **Zero Trust Security**: Every request is authenticated and authorized
- **Centralized Access Control**: Manage who can access your admin area from one dashboard
- **Audit Logging**: Complete visibility into access attempts and usage
- **Device Policies**: Enforce security requirements like device certificates
- **Geographic Restrictions**: Limit access by location
- **Time-based Access**: Set access windows for additional security

## 🚀 Step-by-Step Setup

### Step 1: Cloudflare Zero Trust Dashboard

1. **Log in to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Navigate to "Zero Trust" in the left sidebar

2. **Set up Zero Trust (if first time)**
   - Choose your team domain (e.g., `mustardtree.cloudflareaccess.com`)
   - Complete the initial setup wizard

### Step 2: Create an Access Application

1. **Navigate to Applications**
   - Go to `Access` → `Applications`
   - Click `Add an Application`

2. **Choose Application Type**
   - Select `Self-hosted`
   - Click `Next`

3. **Configure Application Details**
   ```
   Application name: MustardTree Partners Blog Admin
   Session Duration: 24 hours (or your preference)
   Application domain: yourdomain.com
   Path: /admin/*
   ```

4. **Add Application Domain**
   - Domain: `yourdomain.com` (your blog domain)
   - Path: `/admin/*` (protects all admin routes)
   - Type: `HTTP`

### Step 3: Configure Access Policies

1. **Create Allow Policy**
   ```
   Policy name: Blog Admin Access
   Action: Allow
   
   Rules (choose one or combine):
   - Email: admin@mustardtreepartners.com
   - Email domain: mustardtreepartners.com
   - Groups: blog-admins (if using SAML/OIDC)
   ```

2. **Optional: Add Additional Security**
   - Require device certificates
   - Geographic restrictions
   - Time-based access windows
   - Multi-factor authentication

### Step 4: Copy Application Configuration

1. **Get Application AUD**
   - In your application settings, copy the `Application Audience (AUD)` tag
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

2. **Get Team Domain**
   - Your team domain from Step 1
   - Example: `mustardtree.cloudflareaccess.com`

### Step 5: Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Authentication Mode
AUTH_MODE=cloudflare

# Cloudflare Access Configuration
CLOUDFLARE_ACCESS_DOMAIN=mustardtree.cloudflareaccess.com
CLOUDFLARE_ACCESS_AUD=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0

# Admin Access Control
ADMIN_EMAILS=admin@mustardtreepartners.com,you@yourcompany.com
ADMIN_DOMAINS=mustardtreepartners.com

# Production
NODE_ENV=production
```

### Step 6: Deploy and Test

1. **Deploy Your Application**
   - Ensure environment variables are set in your hosting platform
   - Deploy the updated code

2. **Test Authentication Flow**
   - Visit `yourdomain.com/admin`
   - You should be redirected to Cloudflare Access login
   - After authentication, you'll be redirected back to your admin area

## 🧪 Development and Testing

### Local Development Setup

For testing locally, you can use mock authentication:

```bash
# .env.local
NODE_ENV=development
DEV_MOCK_AUTH=true
DEV_MOCK_USER_EMAIL=dev@mustardtreepartners.com
DEV_MOCK_USER_NAME=Development User
```

### Testing Checklist

- [ ] Can access `/admin` and get redirected to Cloudflare Access
- [ ] Can authenticate with authorized account
- [ ] Can access admin dashboard after authentication
- [ ] Unauthorized users are properly blocked
- [ ] Can logout and login again
- [ ] Admin functions work properly

## 🛠️ Troubleshooting

### Common Issues

1. **"Application not found" error**
   - Check `CLOUDFLARE_ACCESS_DOMAIN` is correct
   - Verify the application is published in Cloudflare Access

2. **"Access denied" error**
   - Check your access policies include your email/domain
   - Verify `ADMIN_EMAILS` or `ADMIN_DOMAINS` environment variables

3. **JWT verification fails**
   - Check `CLOUDFLARE_ACCESS_AUD` matches your application
   - Ensure your domain is properly configured in Cloudflare Access

4. **Infinite redirect loops**
   - Check that `/admin/*` path is protected in Cloudflare Access
   - Verify your application domain matches your actual domain

### Debug Mode

Enable debug logging in development:

```bash
DEBUG_AUTH=true
```

## 🔒 Security Best Practices

### Access Policies

1. **Principle of Least Privilege**
   - Only grant access to users who need it
   - Use specific email addresses rather than broad domain rules

2. **Multi-layered Security**
   ```
   Policy 1: Email domain restriction
   Policy 2: Geographic restriction (if applicable)
   Policy 3: Device certificate requirement (optional)
   ```

3. **Regular Access Reviews**
   - Review who has access monthly
   - Remove access for inactive users
   - Monitor access logs for unusual activity

### Environment Security

1. **Protect Environment Variables**
   - Never commit `.env` files to version control
   - Use secure secret management in production
   - Rotate AUD tags periodically

2. **Monitor Access Logs**
   - Set up alerts for failed authentication attempts
   - Monitor for access from unusual locations
   - Review admin activity logs regularly

## 📊 Migration from Username/Password

If you're migrating from the old bcrypt-based authentication:

1. **Backup Current Setup**
   - Keep the old authentication files as backup
   - Document current admin users

2. **Update Environment**
   - Change `AUTH_MODE` from `local` to `cloudflare`
   - Add Cloudflare Access configuration

3. **Test Migration**
   - Test in staging environment first
   - Verify all admin users can access via Cloudflare Access
   - Confirm all admin functions work

4. **Go Live**
   - Deploy to production
   - Notify admin users of the change
   - Monitor for any issues

## 🎯 Advanced Configuration

### Custom Claims

You can use custom claims in your JWT for advanced access control:

```typescript
// In your access policy, you can check for custom attributes
if (user.groups?.includes('blog-admin') || user.custom?.role === 'admin') {
  return true;
}
```

### Integration with SAML/OIDC

For enterprise environments, you can connect Cloudflare Access to:
- Azure Active Directory
- Google Workspace
- Okta
- Auth0
- Custom SAML providers

### Audit and Compliance

- All access attempts are logged in Cloudflare Analytics
- Export logs for compliance reporting
- Set up automated alerts for security events

## 📞 Support and Resources

- **Cloudflare Access Documentation**: https://developers.cloudflare.com/cloudflare-one/applications/
- **Zero Trust Learning Center**: https://www.cloudflare.com/learning/security/glossary/what-is-zero-trust/
- **Community Support**: https://community.cloudflare.com/

---

**Status**: ✅ **READY FOR PRODUCTION**  
**Security Level**: 🔒 **ENTERPRISE-GRADE**  
**Maintenance**: 🔄 **MINIMAL** (managed by Cloudflare)