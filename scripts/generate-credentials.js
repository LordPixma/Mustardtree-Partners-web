#!/usr/bin/env node

/**
 * Production Credential Generator for MustardTree Partners Blog
 * 
 * This script helps generate secure credentials for production deployment.
 * Run with: node scripts/generate-credentials.js
 */

import bcrypt from 'bcryptjs';

class CredentialGenerator {
  static generateSecurePassword(length = 16) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Ensure at least one character from each required category
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }

  static validatePassword(password) {
    const errors = [];
    
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

async function main() {
  console.log('🔐 MustardTree Partners Blog - Production Credential Generator');
  console.log('============================================================\n');

  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    const useCustomPassword = args.some(arg => arg === '--custom-password');
    const usernameArg = args.find(arg => arg.startsWith('--username='));
    const emailArg = args.find(arg => arg.startsWith('--email='));
    
    const username = usernameArg ? usernameArg.split('=')[1] : 'webadmin';
    const email = emailArg ? emailArg.split('=')[1] : 'admin@mustardtreepartners.com';

    let password;

    if (useCustomPassword) {
      // In a real scenario, you'd prompt for password input securely
      console.log('⚠️  Custom password mode enabled.');
      console.log('📝 Please set your password in the CUSTOM_PASSWORD environment variable');
      console.log('   Example: CUSTOM_PASSWORD="YourSecurePassword123!" node scripts/generate-credentials.js --custom-password\n');
      
      password = process.env.CUSTOM_PASSWORD;
      if (!password) {
        console.error('❌ Error: CUSTOM_PASSWORD environment variable not set');
        process.exit(1);
      }

      // Validate custom password
      const validation = CredentialGenerator.validatePassword(password);
      if (!validation.isValid) {
        console.error('❌ Password validation failed:');
        validation.errors.forEach(error => console.error(`   - ${error}`));
        process.exit(1);
      }
    } else {
      // Generate secure password
      password = CredentialGenerator.generateSecurePassword(20);
      console.log('🎲 Generated secure password automatically\n');
    }

    // Hash the password
    console.log('🔒 Hashing password with bcrypt (salt rounds: 12)...');
    const passwordHash = await CredentialGenerator.hashPassword(password);
    
    console.log('\n✅ Credentials generated successfully!\n');
    
    // Display results
    console.log('📋 PRODUCTION ENVIRONMENT VARIABLES:');
    console.log('=====================================');
    console.log(`ADMIN_USERNAME=${username}`);
    console.log(`ADMIN_EMAIL=${email}`);
    console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
    console.log('NODE_ENV=production\n');

    console.log('🔑 ADMIN LOGIN CREDENTIALS:');
    console.log('===========================');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}\n`);

    console.log('🚀 DEPLOYMENT INSTRUCTIONS:');
    console.log('============================');
    console.log('1. Copy the environment variables above to your production environment');
    console.log('2. Ensure they are set before starting the application');
    console.log('3. Save the login credentials in a secure location');
    console.log('4. Test the login after deployment');
    console.log('5. Change the password after first login if desired\n');

    console.log('💡 Example for Docker:');
    console.log(`docker run -e ADMIN_USERNAME=${username} \\`);
    console.log(`           -e ADMIN_EMAIL=${email} \\`);
    console.log(`           -e ADMIN_PASSWORD_HASH="${passwordHash}" \\`);
    console.log('           -e NODE_ENV=production \\');
    console.log('           your-app-image\n');

    console.log('💡 Example for systemd/bash:');
    console.log(`export ADMIN_USERNAME="${username}"`);
    console.log(`export ADMIN_EMAIL="${email}"`);
    console.log(`export ADMIN_PASSWORD_HASH="${passwordHash}"`);
    console.log('export NODE_ENV="production"\n');

    console.log('⚠️  SECURITY REMINDERS:');
    console.log('========================');
    console.log('- Store credentials securely and never commit them to version control');
    console.log('- Use HTTPS in production');
    console.log('- Consider implementing 2FA for additional security');
    console.log('- Rotate credentials regularly');
    console.log('- Monitor login attempts and failures\n');

  } catch (error) {
    console.error('❌ Error generating credentials:', error.message);
    process.exit(1);
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('🔐 MustardTree Partners Blog - Production Credential Generator');
  console.log('============================================================\n');
  console.log('Usage: node scripts/generate-credentials.js [options]\n');
  console.log('Options:');
  console.log('  --username=USERNAME     Set custom admin username (default: webadmin)');
  console.log('  --email=EMAIL          Set custom admin email (default: admin@mustardtreepartners.com)');
  console.log('  --custom-password      Use custom password from CUSTOM_PASSWORD env var');
  console.log('  --help, -h             Show this help message\n');
  console.log('Examples:');
  console.log('  # Generate with defaults:');
  console.log('  node scripts/generate-credentials.js\n');
  console.log('  # Custom username and email:');
  console.log('  node scripts/generate-credentials.js --username=admin --email=blog@company.com\n');
  console.log('  # Use custom password:');
  console.log('  CUSTOM_PASSWORD="MySecurePass123!" node scripts/generate-credentials.js --custom-password\n');
  process.exit(0);
}

// Run the generator
main().catch(console.error);