# Production Deployment Security Guide

## 🔐 Secure Admin Authentication

The MustardTree Partners blog system now uses production-grade security with bcrypt password hashing and environment-based configuration.

### ⚠️ IMPORTANT: Migration from Development

If you were using the old development credentials (`webadmin`/`admin123`), you **MUST** follow the production setup below before deploying.

## 🚀 Production Setup

### Step 1: Generate Secure Credentials

Run the credential generator script:

```bash
# Generate with default settings
npm run generate-credentials

# Or with custom username/email
npm run generate-credentials -- --username=admin --email=blog@yourcompany.com

# Or use your own password
CUSTOM_PASSWORD="YourSecurePassword123!" npm run generate-credentials -- --custom-password
```

### Step 2: Set Environment Variables

The script will output environment variables like this:

```bash
ADMIN_USERNAME=webadmin
ADMIN_EMAIL=admin@mustardtreepartners.com
ADMIN_PASSWORD_HASH=$2a$12$abcdefghijklmnopqrstuvwxyz123456789
NODE_ENV=production
```

### Step 3: Deploy with Environment Variables

#### Docker Deployment
```bash
docker run -e ADMIN_USERNAME=webadmin \
           -e ADMIN_EMAIL=admin@mustardtreepartners.com \
           -e ADMIN_PASSWORD_HASH="$2a$12$your-hash-here" \
           -e NODE_ENV=production \
           your-app-image
```

#### Cloudflare Pages
Set these as environment variables in your Cloudflare Pages dashboard:
- `ADMIN_USERNAME`
- `ADMIN_EMAIL`  
- `ADMIN_PASSWORD_HASH`
- `NODE_ENV=production`

#### Traditional Server
```bash
export ADMIN_USERNAME="webadmin"
export ADMIN_EMAIL="admin@mustardtreepartners.com"
export ADMIN_PASSWORD_HASH="$2a$12$your-hash-here"
export NODE_ENV="production"
npm start
```

## 🔒 Security Features

### Password Requirements
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Security Measures
- ✅ bcrypt password hashing (12 salt rounds)
- ✅ Rate limiting for login attempts
- ✅ Input sanitization and validation
- ✅ Secure credential generation
- ✅ Environment-based configuration
- ✅ Development vs Production separation

## 🛠️ Development vs Production

### Development Mode
- Auto-generates secure credentials on first run
- Displays credentials in console (one time only)
- Uses temporary fallback if generation fails
- Stores credentials in localStorage

### Production Mode
- Requires environment variables to be set
- Fails securely if credentials are missing
- No credential display in logs
- Uses bcrypt for all password operations

## 🔄 Credential Management

### First Login
1. Use the generated username and password from the setup script
2. Navigate to `/admin/login`
3. Login with generated credentials
4. Immediately change password via the admin dashboard (⚙️ Settings icon)

### Password Changes
- Use the admin dashboard settings (⚙️ icon)
- Enforces strong password requirements
- Securely hashes new passwords

### Credential Rotation
To rotate credentials:
1. Generate new credentials: `npm run generate-credentials`
2. Update environment variables
3. Restart application
4. Clear browser localStorage if needed

## 🚨 Security Checklist

Before going to production:

- [ ] Generated secure credentials using the script
- [ ] Set all required environment variables
- [ ] Verified `NODE_ENV=production`
- [ ] Tested login with production credentials
- [ ] Enabled HTTPS
- [ ] Secured environment variable storage
- [ ] Removed any hardcoded credentials
- [ ] Tested password change functionality
- [ ] Set up credential backup/recovery process

## 🆘 Troubleshooting

### "Missing production admin credentials" Error
- Ensure all environment variables are set: `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`
- Verify `NODE_ENV=production`
- Check that password hash was generated with bcrypt

### Login Failed
- Verify credentials were generated correctly
- Check environment variables are loaded
- Clear browser localStorage and try again
- Check browser console for rate limiting messages

### Development Fallback
If admin generation fails in development, a temporary fallback is used:
- Username: `admin`
- Password: `TempPassword123!`
- **This only works in development mode**

## 📞 Support

For security-related issues or questions about production deployment, please refer to the development team or security documentation.