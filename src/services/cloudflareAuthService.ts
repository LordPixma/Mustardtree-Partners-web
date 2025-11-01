/**
 * Cloudflare Access Authentication Service
 * 
 * This service handles authentication through Cloudflare Access,
 * eliminating the need for traditional username/password credentials.
 */

export interface CloudflareAccessUser {
  id: string;
  email: string;
  name?: string;
  groups?: string[];
  identity_nonce?: string;
  custom?: Record<string, any>;
}

export interface CloudflareAccessConfig {
  domain: string; // Your Cloudflare Access domain (e.g., myapp.myteam.cloudflareaccess.com)
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
    // In browser environment, return hardcoded config for development
    if (typeof process === 'undefined' || typeof window !== 'undefined') {
      // For development, return the configuration from your .env file
      // Using SELF-HOSTED Cloudflare Access on main domain
      // The Application URL from your screenshot: mustardtreegroup.com/admin/*
      return {
        domain: 'mustardtreegroup.com', // Your main domain with SELF-HOSTED Access
        applicationAUD: '2ab81f6bcbd116922eb63640376f7c539fc5d773b453d019edd8360fb3413a30',
        certsUrl: undefined
      };
    }

    // Node.js environment (SSR or build time)
    const domain = process.env.CLOUDFLARE_ACCESS_DOMAIN;
    const applicationAUD = process.env.CLOUDFLARE_ACCESS_AUD;

    if (!domain || !applicationAUD) {
      console.warn('Cloudflare Access not configured. Missing CLOUDFLARE_ACCESS_DOMAIN or CLOUDFLARE_ACCESS_AUD');
      return null;
    }

    return {
      domain,
      applicationAUD,
      certsUrl: process.env.CLOUDFLARE_ACCESS_CERTS_URL
    };
  }

  /**
   * Check if user is authenticated via Cloudflare Access
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
      // Check for mock user in development (browser environment)
      if (typeof window !== 'undefined') {
        const mockUser = this.getMockUser();
        if (mockUser) {
          return mockUser;
        }
      }

      // In a browser environment, we would typically get the JWT from cookies
      // that Cloudflare Access automatically sets
      const jwt = this.getJWTFromCookies();
      
      if (!jwt) {
        return null;
      }

      const user = await this.verifyJWT(jwt);
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Get JWT token from Cloudflare Access cookies
   */
  private static getJWTFromCookies(): string | null {
    if (typeof document === 'undefined') {
      // Server-side rendering or Node.js environment
      return null;
    }

    // Cloudflare Access sets a cookie named CF_Authorization
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
   * Verify Cloudflare Access JWT token
   */
  private static async verifyJWT(jwt: string): Promise<CloudflareAccessUser | null> {
    if (!this.config) {
      const envConfig = this.getConfigFromEnv();
      if (!envConfig) {
        throw new Error('Cloudflare Access not configured');
      }
      this.config = envConfig;
    }

    try {
      // Parse JWT header to get key ID
      const [headerB64] = jwt.split('.');
      const header = JSON.parse(atob(headerB64));
      const keyId = header.kid;

      if (!keyId) {
        throw new Error('JWT missing key ID');
      }

      // Get public key for verification
      const publicKey = await this.getPublicKey(keyId);
      if (!publicKey) {
        throw new Error(`Public key not found for key ID: ${keyId}`);
      }

      // In a real implementation, you would verify the JWT signature here
      // For this example, we'll decode the payload (in production, use a proper JWT library)
      const [, payloadB64] = jwt.split('.');
      const payload = JSON.parse(atob(payloadB64));

      // Verify audience
      if (payload.aud !== this.config.applicationAUD) {
        throw new Error('Invalid audience');
      }

      // Verify expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      // Extract user information
      const user: CloudflareAccessUser = {
        id: payload.sub || payload.email,
        email: payload.email,
        name: payload.name,
        groups: payload.groups,
        identity_nonce: payload.identity_nonce,
        custom: payload.custom
      };

      return user;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  /**
   * Fetch Cloudflare Access public keys for JWT verification
   */
  private static async getPublicKey(keyId: string): Promise<string | null> {
    // Check cache first
    const now = Date.now();
    if (this.publicKeys[keyId] && (now - this.lastKeyFetch) < this.KEY_CACHE_DURATION) {
      return this.publicKeys[keyId];
    }

    if (!this.config) {
      throw new Error('Cloudflare Access not configured');
    }

    try {
      // Fetch public keys from Cloudflare Access
      const certsUrl = this.config.certsUrl || `https://${this.config.domain}/cdn-cgi/access/certs`;
      const response = await fetch(certsUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch public keys: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the keys
      this.publicKeys = {};
      if (data.keys) {
        for (const key of data.keys) {
          this.publicKeys[key.kid] = key.n; // RSA public key modulus
        }
      }
      
      this.lastKeyFetch = now;
      return this.publicKeys[keyId] || null;
    } catch (error) {
      console.error('Failed to fetch public keys:', error);
      return null;
    }
  }

  /**
   * Redirect user to Cloudflare Access login
   */
  static redirectToLogin(): void {
    if (!this.config) {
      const envConfig = this.getConfigFromEnv();
      if (!envConfig) {
        console.error('Cannot redirect to login: Cloudflare Access not configured');
        return;
      }
      this.config = envConfig;
    }

    // Redirect to Cloudflare Access login page
    const loginUrl = `https://${this.config.domain}/cdn-cgi/access/login`;
    window.location.href = loginUrl;
  }

  /**
   * Logout from Cloudflare Access
   */
  static logout(): void {
    // Handle mock authentication logout in development
    if (typeof window !== 'undefined') {
      // Clear mock user from sessionStorage
      sessionStorage.removeItem('mock_cf_user');
      
      // Also clear any CF_Authorization cookie
      document.cookie = 'CF_Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // For development with mock auth, just redirect to login
      if (sessionStorage.getItem('mock_cf_user') === null) {
        window.location.href = '/admin/login';
        return;
      }
    }

    // Production Cloudflare Access logout
    if (!this.config) {
      const envConfig = this.getConfigFromEnv();
      if (!envConfig) {
        console.error('Cannot logout: Cloudflare Access not configured');
        // Fallback: redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
        return;
      }
      this.config = envConfig;
    }

    const logoutUrl = `https://${this.config.domain}/cdn-cgi/access/logout`;
    window.location.href = logoutUrl;
  }

  /**
   * Check if user has required admin permissions
   */
  static async hasAdminAccess(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        return false;
      }

      // You can implement your own access control logic here
      // For example, check if user is in an admin group or has specific email domain
      const adminEmails = ['samuel@lgger.com']; // Hardcoded for browser environment
      const adminDomains = ['lgger.com', 'mustardtreegroup.com', 'odeounile.com']; // From your Cloudflare Access config
      
      // Check if user email is in admin list
      if (adminEmails.includes(user.email)) {
        return true;
      }

      // Check if user email domain is in admin domains
      const emailDomain = user.email.split('@')[1];
      if (adminDomains.includes(emailDomain)) {
        return true;
      }

      // Check if user is in admin groups (if groups are configured in Cloudflare Access)
      if (user.groups && user.groups.includes('admin')) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Admin access check failed:', error);
      return false;
    }
  }

  /**
   * Development mode helper - simulate authenticated user
   */
  static mockAuthenticatedUser(user: CloudflareAccessUser): void {
    // Allow mock authentication in development
    if (typeof window !== 'undefined') {
      // Store mock user in sessionStorage for development
      sessionStorage.setItem('mock_cf_user', JSON.stringify(user));
    } else {
      console.warn('Mock authentication only available in browser environment');
    }
  }

  /**
   * Get mock user for development
   */
  private static getMockUser(): CloudflareAccessUser | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const mockUser = sessionStorage.getItem('mock_cf_user');
    return mockUser ? JSON.parse(mockUser) : null;
  }
}

/**
 * React hook for Cloudflare Access authentication
 */
export const useCloudflareAuth = () => {
  const [user, setUser] = React.useState<CloudflareAccessUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasAdminAccess, setHasAdminAccess] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const currentUser = await CloudflareAccessService.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          const adminAccess = await CloudflareAccessService.hasAdminAccess();
          setHasAdminAccess(adminAccess);
        } else {
          setHasAdminAccess(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setHasAdminAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = () => {
    CloudflareAccessService.redirectToLogin();
  };

  const logout = () => {
    CloudflareAccessService.logout();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasAdminAccess,
    login,
    logout
  };
};

// Import React for the hook
import React from 'react';