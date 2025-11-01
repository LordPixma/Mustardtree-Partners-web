#!/usr/bin/env node

/**
 * Migration Script: Username/Password to Cloudflare Access
 * 
 * This script helps migrate from bcrypt-based authentication to Cloudflare Access
 */

import fs from 'fs';
import path from 'path';

const MIGRATION_STEPS = [
  {
    step: 1,
    title: 'Backup Current Authentication',
    description: 'Create backup of current authentication files',
    action: async () => {
      const backupDir = './auth-backup';
      const filesToBackup = [
        'src/services/authService.ts',
        'src/services/blogService.ts',
        'src/components/AdminLogin.tsx',
        'src/components/ProtectedRoute.tsx',
        '.env'
      ];

      console.log('📁 Creating backup directory...');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      for (const file of filesToBackup) {
        if (fs.existsSync(file)) {
          const backupFile = path.join(backupDir, path.basename(file));
          fs.copyFileSync(file, backupFile);
          console.log(`   ✅ Backed up ${file} → ${backupFile}`);
        } else {
          console.log(`   ⚠️  File not found: ${file}`);
        }
      }

      console.log(`\n✅ Authentication backup completed in ${backupDir}/`);
    }
  },
  {
    step: 2,
    title: 'Update Environment Configuration',
    description: 'Switch from local auth to Cloudflare Access',
    action: async () => {
      console.log('🔧 Updating environment configuration...');
      
      const envExample = `# ========================================
# MustardTree Partners Blog - Environment Configuration
# ========================================

# ===================
# Authentication Mode
# ===================
AUTH_MODE=cloudflare

# ===============================
# Cloudflare Access Configuration
# ===============================
CLOUDFLARE_ACCESS_DOMAIN=your-app.yourteam.cloudflareaccess.com
CLOUDFLARE_ACCESS_AUD=your-application-aud-tag

# ===================
# Admin Access Control
# ===================
ADMIN_EMAILS=admin@mustardtreepartners.com
ADMIN_DOMAINS=mustardtreepartners.com

# ===================
# Application Settings
# ===================
NODE_ENV=production

# ===================
# Development Settings
# ===================
DEV_MOCK_AUTH=false
DEV_MOCK_USER_EMAIL=dev@mustardtreepartners.com
DEV_MOCK_USER_NAME=Development User
`;

      fs.writeFileSync('.env.cloudflare', envExample);
      console.log('   ✅ Created .env.cloudflare template file');
      console.log('   📝 Please update with your actual Cloudflare Access configuration');
    }
  },
  {
    step: 3,
    title: 'Verify New Components',
    description: 'Check that Cloudflare Access components are in place',
    action: async () => {
      console.log('🔍 Verifying Cloudflare Access components...');
      
      const requiredFiles = [
        'src/services/cloudflareAuthService.ts',
        'src/components/CloudflareLogin.tsx',
        'src/components/AdminRouter.tsx'
      ];

      let allFilesPresent = true;

      for (const file of requiredFiles) {
        if (fs.existsSync(file)) {
          console.log(`   ✅ ${file}`);
        } else {
          console.log(`   ❌ ${file} - MISSING`);
          allFilesPresent = false;
        }
      }

      if (allFilesPresent) {
        console.log('\n✅ All Cloudflare Access components are in place');
      } else {
        console.log('\n❌ Some components are missing. Please run the setup again.');
        process.exit(1);
      }
    }
  },
  {
    step: 4,
    title: 'Generate Migration Checklist',
    description: 'Create a checklist for completing the migration',
    action: async () => {
      console.log('📋 Generating migration checklist...');
      
      const checklist = `# 🔄 Migration Checklist: Cloudflare Access

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
**Migration Date**: ${new Date().toISOString().split('T')[0]}
**Status**: In Progress
`;

      fs.writeFileSync('MIGRATION-CHECKLIST.md', checklist);
      console.log('   ✅ Created MIGRATION-CHECKLIST.md');
    }
  }
];

async function runMigration() {
  console.log('🔄 MustardTree Partners Blog - Authentication Migration');
  console.log('======================================================');
  console.log('');
  console.log('This script will help you migrate from username/password');
  console.log('authentication to Cloudflare Access (IdP) authentication.');
  console.log('');

  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    console.error('❌ Error: This script must be run from the project root directory');
    process.exit(1);
  }

  // Check if this is the right project
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.name !== 'magic-patterns-vite-template') {
    console.error('❌ Error: This doesn\'t appear to be the MustardTree Partners project');
    process.exit(1);
  }

  console.log('🚀 Starting migration process...\n');

  for (const step of MIGRATION_STEPS) {
    console.log(`\n${step.step}️⃣ Step ${step.step}: ${step.title}`);
    console.log(`📝 ${step.description}`);
    console.log('');

    try {
      await step.action();
    } catch (error) {
      console.error(`❌ Error in step ${step.step}:`, error.message);
      process.exit(1);
    }

    console.log('');
  }

  console.log('🎉 Migration preparation completed!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Set up Cloudflare Access (see CLOUDFLARE-ACCESS-SETUP.md)');
  console.log('2. Update .env.cloudflare with your actual configuration');
  console.log('3. Test in development/staging environment');
  console.log('4. Deploy to production');
  console.log('5. Complete the MIGRATION-CHECKLIST.md');
  console.log('');
  console.log('📞 If you need help, refer to the documentation or support resources.');
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('🔄 Authentication Migration Script');
  console.log('==================================');
  console.log('');
  console.log('This script helps you migrate from username/password authentication');
  console.log('to Cloudflare Access (IdP) authentication.');
  console.log('');
  console.log('Usage: node scripts/migrate-auth.js');
  console.log('');
  console.log('The script will:');
  console.log('1. Backup your current authentication files');
  console.log('2. Create environment configuration templates');
  console.log('3. Verify new components are in place');
  console.log('4. Generate a migration checklist');
  console.log('');
  process.exit(0);
}

// Run the migration
runMigration().catch(console.error);