import bcrypt from 'bcryptjs';
import type { AdminUser } from '../types/blog';

/**
 * Secure authentication utilities for production use
 */
export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_PASSWORD_LENGTH = 12;

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a strong random password
   */
  static generateSecurePassword(length: number = 16): string {
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

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    score: number; // 0-5
  } {
    const errors: string[] = [];
    let score = 0;

    if (password.length < this.MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`);
    } else {
      score++;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score++;
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score++;
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score++;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score++;
    }

    // Additional scoring for length
    if (password.length >= 16) score++;

    return {
      isValid: errors.length === 0,
      errors,
      score
    };
  }

  /**
   * Create initial admin user with secure credentials
   */
  static async createInitialAdmin(): Promise<{
    user: AdminUser;
    plaintextPassword: string;
  }> {
    // Generate secure credentials
    const username = 'admin';
    const email = process.env.ADMIN_EMAIL || 'admin@mustardtreepartners.com';
    const plaintextPassword = this.generateSecurePassword(16);
    const passwordHash = await this.hashPassword(plaintextPassword);

    const adminUser: AdminUser = {
      id: crypto.randomUUID(),
      username,
      email,
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: undefined
    };

    return {
      user: adminUser,
      plaintextPassword
    };
  }

  /**
   * Get admin credentials from environment variables (for production)
   */
  static getProductionCredentials(): {
    username: string;
    email: string;
    passwordHash?: string;
  } | null {
    const username = process.env.ADMIN_USERNAME;
    const email = process.env.ADMIN_EMAIL;
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!username || !email) {
      return null;
    }

    return {
      username,
      email,
      passwordHash
    };
  }

  /**
   * Setup method to be called on first run
   */
  static async setupInitialCredentials(): Promise<{
    success: boolean;
    credentials?: {
      username: string;
      password: string;
      email: string;
    };
    error?: string;
  }> {
    try {
      // Check if we're in production and have environment variables
      const prodCredentials = this.getProductionCredentials();
      
      if (process.env.NODE_ENV === 'production') {
        if (!prodCredentials || !prodCredentials.passwordHash) {
          return {
            success: false,
            error: 'Production environment requires ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD_HASH environment variables'
          };
        }
        
        // In production, credentials are managed via environment variables
        return {
          success: true
        };
      }

      // Development: create secure credentials
      const { user, plaintextPassword } = await this.createInitialAdmin();
      
      return {
        success: true,
        credentials: {
          username: user.username,
          password: plaintextPassword,
          email: user.email
        }
      };
    } catch (error) {
      console.error('Failed to setup initial credentials:', error);
      return {
        success: false,
        error: 'Failed to setup initial credentials'
      };
    }
  }
}

/**
 * Environment configuration helper
 */
export class EnvConfig {
  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  }

  static getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Required environment variable ${name} is not set`);
    }
    return value;
  }

  static getOptionalEnvVar(name: string, defaultValue: string = ''): string {
    return process.env[name] || defaultValue;
  }
}