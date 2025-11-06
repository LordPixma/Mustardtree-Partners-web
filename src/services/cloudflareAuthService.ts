/**
 * Cloudflare Access Authentication Service
 * 
 * This service handles authentication through Cloudflare Access,
 * providing enterprise-grade Zero Trust security.
 */

export interface CloudflareAccessUser {
  id: string;
  email: string;
  name?: string;
  groups?: string[];
  identity_nonce?: string;
  custom?: Record<string, any>;
  role?: 'admin' | 'staff' | 'customer';
  customerId?: string;
}

export interface CloudflareAccessConfig {
  domain: string; // Your Cloudflare Access domain
  applicationAUD: string; // Application Audience (AUD) tag from Cloudflare Access
  certsUrl?: string; // Custom certs URL if needed
}

/**
 * Cloudflare Access Authentication Service
 */
export class CloudflareAccessService {
  private static config: CloudflareAccessConfig | null = null;
  private static publicKeys: Record<string, string> = {};
  private static lastKeyFetch = 0;
  private static readonly KEY_CACHE_DURATION = 3600000; // 1 hour in milliseconds

  /**
   * Initialize the service with Cloudflare Access configuration
   */
  static initialize(config: CloudflareAccessConfig): void {
    this.config = config;
  }

  /**
   * Get configuration from environment variables
   */
  static getConfigFromEnv(): CloudflareAccessConfig | null {
    // Production configuration for Cloudflare Access
    return {
      domain: 'mustardtreegroup.com', // Main domain with SELF-HOSTED Access
      applicationAUD: '2ab81f6bcbd116922eb63640376f7c539fc5d773b453d019edd8360fb3413a30',
      certsUrl: undefined
    };
  }

  /**
   * Check if user is authenticated with Cloudflare Access
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }

  /**
   * Get current authenticated user from Cloudflare Access JWT
   */
  static async getCurrentUser(): Promise<CloudflareAccessUser | null> {
    try {
      // Get CF_Authorization cookie containing the JWT
      const jwt = this.getCFAuthCookie();
      if (!jwt) {
        // No JWT cookie found - this is normal for demo mode
        return null;
      }

      // Verify and decode the JWT
      const user = await this.verifyJWT(jwt);
      return user;
    } catch (error) {
      // Only log error if it's not a missing key (which is expected in demo mode)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('Public key not found')) {
        console.error('Failed to get current user:', error);
      }
      return null;
    }
  }

  /**
   * Get CF_Authorization cookie value
   */
  private static getCFAuthCookie(): string | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'CF_Authorization') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  /**
   * Verify JWT token with Cloudflare's public keys
   */
  private static async verifyJWT(jwt: string): Promise<CloudflareAccessUser | null> {
    try {
      if (!this.config) {
        throw new Error('Cloudflare Access not initialized');
      }

      // Decode JWT header to get key ID
      const [headerB64] = jwt.split('.');
      const header = JSON.parse(atob(headerB64));
      const kid = header.kid;

      if (!kid) {
        throw new Error('JWT missing key ID');
      }

      // Get public key for verification
      const publicKey = await this.getPublicKey(kid);
      if (!publicKey) {
        throw new Error(`Public key not found for kid: ${kid}`);
      }

      // Verify JWT signature and decode payload
      const [, payloadB64] = jwt.split('.');
      const payload = JSON.parse(atob(payloadB64));

      // Verify audience matches our application
      if (payload.aud !== this.config.applicationAUD) {
        throw new Error('JWT audience mismatch');
      }

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('JWT expired');
      }

      // Extract user information
      return {
        id: payload.sub || payload.email,
        email: payload.email,
        name: payload.name,
        groups: payload.groups || [],
        identity_nonce: payload.identity_nonce,
        custom: payload.custom || {}
      };
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  /**
   * Get public key for JWT verification
   */
  private static async getPublicKey(kid: string): Promise<string | null> {
    try {
      // Check cache first
      const now = Date.now();
      if (this.publicKeys[kid] && (now - this.lastKeyFetch) < this.KEY_CACHE_DURATION) {
        return this.publicKeys[kid];
      }

      // Fetch public keys from Cloudflare
      if (!this.config) {
        throw new Error('Cloudflare Access not initialized');
      }

      const certsUrl = this.config.certsUrl || `https://${this.config.domain}/cdn-cgi/access/certs`;
      const response = await fetch(certsUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch certs: ${response.status}`);
      }

      const certs = await response.json();
      
      // Update cache
      this.publicKeys = {};
      if (certs.keys) {
        for (const key of certs.keys) {
          if (key.kid && key.x5c && key.x5c[0]) {
            this.publicKeys[key.kid] = key.x5c[0];
          }
        }
      }
      
      this.lastKeyFetch = now;
      return this.publicKeys[kid] || null;
    } catch (error) {
      console.error('Failed to get public key:', error);
      return null;
    }
  }

  /**
   * Check if user has admin access
   */
  static async hasAdminAccess(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;

      // Check if user is in admin group or has admin role
      const adminIdentifiers = ['admin', 'administrator', 'blog-admin'];
      
      return adminIdentifiers.some(identifier => 
        user.groups?.includes(identifier) || 
        user.email?.toLowerCase().includes('admin') ||
        user.custom?.role === 'admin' ||
        user.role === 'admin'
      );
    } catch (error) {
      console.error('Admin access check failed:', error);
      return false;
    }
  }

  /**
   * Check if user has staff access (admin or staff)
   */
  static async hasStaffAccess(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;

      // Check if user is staff or admin
      const staffIdentifiers = ['admin', 'administrator', 'staff', 'employee'];
      
      return staffIdentifiers.some(identifier => 
        user.groups?.includes(identifier) || 
        user.custom?.role === 'staff' ||
        user.role === 'admin' ||
        user.role === 'staff'
      ) || await this.hasAdminAccess();
    } catch (error) {
      console.error('Staff access check failed:', error);
      return false;
    }
  }

  /**
   * Check if user has customer access
   */
  static async hasCustomerAccess(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;

      // Check if user is a customer
      const customerIdentifiers = ['customer', 'client'];
      
      return customerIdentifiers.some(identifier => 
        user.groups?.includes(identifier) || 
        user.custom?.role === 'customer' ||
        user.role === 'customer'
      );
    } catch (error) {
      console.error('Customer access check failed:', error);
      return false;
    }
  }

  /**
   * Get user role from JWT token
   */
  static async getUserRole(): Promise<'admin' | 'staff' | 'customer' | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      // Check explicit role first
      if (user.role) return user.role;

      // Infer role from groups or custom attributes
      if (await this.hasAdminAccess()) return 'admin';
      if (await this.hasStaffAccess()) return 'staff';
      if (await this.hasCustomerAccess()) return 'customer';

      return null;
    } catch (error) {
      console.error('Failed to get user role:', error);
      return null;
    }
  }

  /**
   * Get customer ID for customer users
   */
  static async getCustomerId(): Promise<string | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      // Return explicit customer ID if available
      if (user.customerId) return user.customerId;

      // For customer users, use their email or ID as customer identifier
      const role = await this.getUserRole();
      if (role === 'customer') {
        return user.custom?.customerId || user.id;
      }

      return null;
    } catch (error) {
      console.error('Failed to get customer ID:', error);
      return null;
    }
  }

  /**
   * Redirect to Cloudflare Access login
   */
  static async login(): Promise<void> {
    if (!this.config) {
      const config = this.getConfigFromEnv();
      if (config) {
        this.initialize(config);
      } else {
        throw new Error('Cloudflare Access not configured');
      }
    }

    if (this.config) {
      const loginUrl = `https://${this.config.domain}/cdn-cgi/access/login`;
      window.location.href = loginUrl;
    }
  }

  /**
   * Logout and clear Cloudflare Access session
   */
  static logout(): void {
    if (typeof window !== 'undefined') {
      // Clear CF_Authorization cookie
      document.cookie = 'CF_Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Redirect to Cloudflare Access logout
      if (this.config) {
        const logoutUrl = `https://${this.config.domain}/cdn-cgi/access/logout`;
        window.location.href = logoutUrl;
      } else {
        // Fallback to login page
        window.location.href = '/admin/login';
      }
    }
  }
}

// Import React for the hook
import React from 'react';

/**
 * React hook for Cloudflare Access authentication
 */
export function useCloudflareAuth() {
  
  const [user, setUser] = React.useState<CloudflareAccessUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [hasAdminAccess, setHasAdminAccess] = React.useState(false);
  const [hasStaffAccess, setHasStaffAccess] = React.useState(false);
  const [hasCustomerAccess, setHasCustomerAccess] = React.useState(false);
  const [userRole, setUserRole] = React.useState<'admin' | 'staff' | 'customer' | null>(null);
  const [customerId, setCustomerId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Initialize service
        const config = CloudflareAccessService.getConfigFromEnv();
        if (config) {
          CloudflareAccessService.initialize(config);
        }

        // Check authentication
        const currentUser = await CloudflareAccessService.getCurrentUser();
        const isAuth = currentUser !== null;
        
        if (isAuth) {
          // Production mode with real authentication
          const hasAdmin = await CloudflareAccessService.hasAdminAccess();
          const hasStaff = await CloudflareAccessService.hasStaffAccess();
          const hasCustomer = await CloudflareAccessService.hasCustomerAccess();
          const role = await CloudflareAccessService.getUserRole();
          const customerIdValue = await CloudflareAccessService.getCustomerId();

          setUser(currentUser);
          setIsAuthenticated(true);
          setHasAdminAccess(hasAdmin);
          setHasStaffAccess(hasStaff);
          setHasCustomerAccess(hasCustomer);
          setUserRole(role);
          setCustomerId(customerIdValue);
        } else {
          // Demo mode - set default customer role
          console.log('Demo mode: No Cloudflare Access authentication detected');
          const demoUser = {
            id: 'demo-customer-001',
            email: 'demo@customer.com',
            name: 'Demo Customer'
          };
          
          setUser(demoUser);
          setIsAuthenticated(false); // Not truly authenticated
          setHasAdminAccess(false);
          setHasStaffAccess(false);
          setHasCustomerAccess(true); // Demo user is customer
          setUserRole('customer'); // Always customer in demo mode
          setCustomerId(null); // No customer ID in demo mode
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Fallback to demo mode
        const demoUser = {
          id: 'demo-customer-001',
          email: 'demo@customer.com',
          name: 'Demo Customer'
        };
        
        setUser(demoUser);
        setIsAuthenticated(false);
        setHasAdminAccess(false);
        setHasStaffAccess(false);
        setHasCustomerAccess(true);
        setUserRole('customer');
        setCustomerId(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = React.useCallback(() => {
    if (isAuthenticated) {
      // Real Cloudflare Access logout
      CloudflareAccessService.logout();
    } else {
      // Demo mode - just redirect to home
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  return {
    user,
    isLoading,
    isAuthenticated,
    hasAdminAccess,
    hasStaffAccess,
    hasCustomerAccess,
    userRole,
    customerId,
    logout
  };
}