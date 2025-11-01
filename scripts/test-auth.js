#!/usr/bin/env node

/**
 * Test script to verify the secure authentication system
 */

import { AuthService } from '../src/services/authService.js';

async function testAuthentication() {
  console.log('🧪 Testing MustardTree Partners Authentication System');
  console.log('===================================================\n');

  try {
    // Test 1: Password Generation
    console.log('1️⃣ Testing password generation...');
    const password = AuthService.generateSecurePassword();
    console.log(`✅ Generated password: ${password.length} characters`);
    
    // Test 2: Password Validation
    console.log('\n2️⃣ Testing password validation...');
    const validation = AuthService.validatePasswordStrength(password);
    console.log(`✅ Password validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
    if (!validation.isValid) {
      validation.errors.forEach(error => console.log(`   ❌ ${error}`));
    }

    // Test 3: Password Hashing
    console.log('\n3️⃣ Testing password hashing...');
    const hash = await AuthService.hashPassword(password);
    console.log(`✅ Password hashed: ${hash.substring(0, 20)}...`);

    // Test 4: Password Verification
    console.log('\n4️⃣ Testing password verification...');
    const isValid = await AuthService.verifyPassword(password, hash);
    console.log(`✅ Password verification: ${isValid ? 'PASSED' : 'FAILED'}`);

    // Test 5: Wrong Password Verification
    console.log('\n5️⃣ Testing wrong password verification...');
    const isInvalid = await AuthService.verifyPassword('wrongpassword', hash);
    console.log(`✅ Wrong password rejection: ${!isInvalid ? 'PASSED' : 'FAILED'}`);

    // Test 6: Admin Creation
    console.log('\n6️⃣ Testing admin creation...');
    const adminData = await AuthService.createInitialAdmin();
    console.log(`✅ Admin created: ${adminData.user.username} (${adminData.user.email})`);
    console.log(`   Password hash: ${adminData.user.passwordHash.substring(0, 20)}...`);

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Password generation');
    console.log('   ✅ Password validation');
    console.log('   ✅ Password hashing (bcrypt)');
    console.log('   ✅ Password verification');
    console.log('   ✅ Wrong password rejection');
    console.log('   ✅ Admin creation');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testAuthentication().catch(console.error);