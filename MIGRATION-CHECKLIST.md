# 🔄 Migration Checklist: Cloudflare Access

## Pre-Migration Steps
- [ ] Current admin users documented
- [ ] Backup files created in ./auth-backup/
- [ ] Cloudflare Zero Trust account set up
- [ ] Access application created in Cloudflare dashboard

## Cloudflare Access Configuration
- [ ] Application domain set to your blog URL
- [ ] Path set to /admin/*
- [ ] Access policies configured for admin users
- [ ] Application AUD tag copied
- [ ] Team domain noted

## Environment Configuration
- [ ] .env.cloudflare file updated with real values
- [ ] CLOUDFLARE_ACCESS_DOMAIN set
- [ ] CLOUDFLARE_ACCESS_AUD set
- [ ] ADMIN_EMAILS or ADMIN_DOMAINS configured
- [ ] AUTH_MODE set to 'cloudflare'

## Testing Steps
- [ ] Test in staging/development environment first
- [ ] Verify admin users can authenticate via Cloudflare Access
- [ ] Test admin dashboard functionality
- [ ] Test logout functionality
- [ ] Verify unauthorized users are blocked

## Production Deployment
- [ ] Environment variables set in production hosting
- [ ] Code deployed with Cloudflare Access authentication
- [ ] DNS/domain properly configured
- [ ] Admin users notified of authentication change
- [ ] Monitoring set up for authentication issues

## Post-Migration Cleanup
- [ ] Remove old authentication files (after confirming everything works)
- [ ] Update documentation
- [ ] Remove bcrypt dependency if no longer needed
- [ ] Archive credential generation scripts

## Rollback Plan (if needed)
- [ ] Restore files from ./auth-backup/
- [ ] Set AUTH_MODE back to 'local'
- [ ] Restore original environment variables
- [ ] Redeploy previous authentication system

---
**Migration Date**: 2025-11-01
**Status**: In Progress
