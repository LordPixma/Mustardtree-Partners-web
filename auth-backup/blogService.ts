import type { BlogPost, Author, AdminUser } from '../types/blog';
import { sanitizeText, sanitizeHtmlContent, loginRateLimiter } from '../utils/security';
import { AuthService, EnvConfig } from './authService';

// In a real application, this would be connected to a backend API
// For now, we'll use localStorage with a simple state management system

const STORAGE_KEYS = {
  POSTS: 'mustardtree_blog_posts',
  AUTHORS: 'mustardtree_blog_authors',
  ADMIN_USERS: 'mustardtree_admin_users',
  AUTH_TOKEN: 'mustardtree_auth_token',
  CURRENT_USER: 'mustardtree_current_user'
};

// Sample authors
const DEFAULT_AUTHORS: Author[] = [
  {
    id: '1',
    name: 'MustardTree Team',
    bio: 'The expert team at MustardTree Partners, providing insights on governance, compliance, and business intelligence.',
    email: 'info@mustardtreegroup.com',
    position: 'Editorial Team',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample blog posts
const DEFAULT_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Understanding Modern Corporate Governance',
    slug: 'understanding-modern-corporate-governance',
    excerpt: 'Explore the key principles and best practices of corporate governance in today\'s business environment.',
    content: `
# Understanding Modern Corporate Governance

Corporate governance has evolved significantly in recent years, driven by regulatory changes, stakeholder expectations, and technological advances.

## Key Principles

1. **Transparency and Disclosure**
   - Regular and accurate reporting
   - Clear communication with stakeholders
   - Open decision-making processes

2. **Accountability and Responsibility**
   - Clear roles and responsibilities
   - Performance monitoring and evaluation
   - Risk management frameworks

3. **Fairness and Ethics**
   - Equal treatment of stakeholders
   - Ethical business practices
   - Conflict of interest management

## Best Practices

Modern corporate governance requires a holistic approach that balances the interests of all stakeholders while ensuring sustainable business growth.

### Board Composition
- Diverse skills and experience
- Independent directors
- Regular evaluation and refreshment

### Risk Management
- Comprehensive risk assessment
- Clear risk appetite statements
- Regular monitoring and reporting

## Conclusion

Effective corporate governance is not just about compliance—it's about creating sustainable value for all stakeholders.
    `,
    authorId: '1',
    status: 'published',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    seo: {
      metaTitle: 'Understanding Modern Corporate Governance | MustardTree Partners',
      metaDescription: 'Explore key principles and best practices of corporate governance in today\'s business environment with expert insights from MustardTree Partners.',
      keywords: ['corporate governance', 'business compliance', 'stakeholder management', 'board governance']
    },
    tags: ['Governance', 'Compliance', 'Best Practices'],
    category: 'Corporate Governance',
    readingTime: 5
  }
];

class BlogService {
  // Initialize storage with default data if empty
  private async initializeStorage(): Promise<void> {
    // Initialize admin users with secure credentials
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_USERS)) {
      await this.initializeSecureAdmin();
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.AUTHORS)) {
      localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(DEFAULT_AUTHORS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
    }
  }

  private async initializeSecureAdmin(): Promise<void> {
    try {
      if (EnvConfig.isProduction()) {
        // Production: Use environment variables
        const prodCredentials = AuthService.getProductionCredentials();
        
        if (!prodCredentials || !prodCredentials.passwordHash) {
          console.error('❌ PRODUCTION ERROR: Missing required environment variables for admin user');
          console.error('Required: ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD_HASH');
          console.error('Please set these environment variables before starting the application');
          throw new Error('Missing production admin credentials');
        }

        const adminUser: AdminUser = {
          id: crypto.randomUUID(),
          username: prodCredentials.username,
          email: prodCredentials.email,
          passwordHash: prodCredentials.passwordHash,
          role: 'admin',
          createdAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify([adminUser]));
        console.log('✅ Production admin user initialized from environment variables');
        
      } else {
        // Development: Generate secure credentials
        const setup = await AuthService.setupInitialCredentials();
        
        if (!setup.success || !setup.credentials) {
          throw new Error(setup.error || 'Failed to setup credentials');
        }

        const hashedPassword = await AuthService.hashPassword(setup.credentials.password);
        const adminUser: AdminUser = {
          id: crypto.randomUUID(),
          username: setup.credentials.username,
          email: setup.credentials.email,
          passwordHash: hashedPassword,
          role: 'admin',
          createdAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify([adminUser]));
        
        // Show credentials in development only
        console.log('🔐 DEVELOPMENT ADMIN CREDENTIALS GENERATED:');
        console.log('📧 Email:', setup.credentials.email);
        console.log('👤 Username:', setup.credentials.username);
        console.log('🔑 Password:', setup.credentials.password);
        console.log('⚠️  Save these credentials! They will not be shown again.');
        console.log('💡 You can change the password after logging in.');
      }
    } catch (error) {
      console.error('Failed to initialize secure admin:', error);
      
      // Fallback for development only
      if (EnvConfig.isDevelopment()) {
        console.warn('⚠️  Falling back to temporary insecure credentials for development');
        const fallbackAdmin: AdminUser = {
          id: 'fallback-admin',
          username: 'admin',
          email: 'admin@mustardtreepartners.com',
          passwordHash: await AuthService.hashPassword('TempPassword123!'),
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify([fallbackAdmin]));
        console.log('🔓 TEMPORARY FALLBACK CREDENTIALS:');
        console.log('👤 Username: admin');
        console.log('🔑 Password: TempPassword123!');
      } else {
        throw error; // Don't allow fallback in production
      }
    }
  }

  // Authentication methods
  async login(username: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    await this.initializeStorage();
    
    // Check rate limiting
    const clientId = 'login_attempts'; // In a real app, this would be IP-based
    if (loginRateLimiter.isRateLimited(clientId)) {
      const remainingTime = loginRateLimiter.getRemainingTime(clientId);
      return { 
        success: false, 
        error: `Too many login attempts. Please try again in ${Math.ceil(remainingTime / 60)} minutes.` 
      };
    }
    
    // Sanitize inputs
    const cleanUsername = sanitizeText(username);
    const cleanPassword = sanitizeText(password);
    
    const users: AdminUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USERS) || '[]');
    
    // Find user by username first
    const user = users.find(u => u.username === cleanUsername);
    
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Verify password using secure comparison
    const isPasswordValid = await AuthService.verifyPassword(cleanPassword, user.passwordHash);
    
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    if (user) {
      const authToken = btoa(`${user.id}:${Date.now()}`);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
      
      return { success: true, user };
    }
    
    return { success: false, error: 'Invalid credentials' };
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    // Sanitize inputs
    const cleanCurrentPassword = sanitizeText(currentPassword);
    const cleanNewPassword = sanitizeText(newPassword);

    // Get all users
    const users: AdminUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USERS) || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    // Verify current password using secure comparison
    const isCurrentPasswordValid = await AuthService.verifyPassword(cleanCurrentPassword, users[userIndex].passwordHash);
    if (!isCurrentPasswordValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Validate new password strength
    const passwordValidation = AuthService.validatePasswordStrength(cleanNewPassword);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors.join('. ') };
    }

    // Hash new password securely
    const hashedNewPassword = await AuthService.hashPassword(cleanNewPassword);
    users[userIndex].passwordHash = hashedNewPassword;

    // Save updated users
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));

    return { success: true };
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  getCurrentUser(): AdminUser | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Blog post methods
  async getPosts(): Promise<BlogPost[]> {
    await this.initializeStorage();
    const posts: BlogPost[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
    const authors: Author[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTHORS) || '[]');
    
    // Attach author data
    return posts.map(post => ({
      ...post,
      author: authors.find(author => author.id === post.authorId)
    }));
  }

  async getPublishedPosts(): Promise<BlogPost[]> {
    const posts = await this.getPosts();
    return posts
      .filter(post => post.status === 'published')
      .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const posts = await this.getPosts();
    return posts.find(post => post.slug === slug) || null;
  }

  async createPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'slug'>): Promise<BlogPost> {
    const posts = await this.getPosts();
    
    // Sanitize content
    const sanitizedTitle = sanitizeText(postData.title);
    const sanitizedExcerpt = sanitizeText(postData.excerpt);
    const sanitizedContent = sanitizeHtmlContent(postData.content);
    const slug = this.generateSlug(sanitizedTitle);
    
    const newPost: BlogPost = {
      ...postData,
      title: sanitizedTitle,
      excerpt: sanitizedExcerpt,
      content: sanitizedContent,
      id: Date.now().toString(),
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingTime: this.calculateReadingTime(sanitizedContent)
    };

    posts.push(newPost);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return newPost;
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    const posts = await this.getPosts();
    const index = posts.findIndex(post => post.id === id);
    
    if (index === -1) return null;

    const updatedPost = {
      ...posts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      slug: updates.title ? this.generateSlug(updates.title) : posts[index].slug,
      readingTime: updates.content ? this.calculateReadingTime(updates.content) : posts[index].readingTime
    };

    posts[index] = updatedPost;
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return updatedPost;
  }

  async deletePost(id: string): Promise<boolean> {
    const posts = await this.getPosts();
    const filteredPosts = posts.filter(post => post.id !== id);
    
    if (filteredPosts.length === posts.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(filteredPosts));
    return true;
  }

  // Author methods
  async getAuthors(): Promise<Author[]> {
    await this.initializeStorage();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTHORS) || '[]');
  }

  async getAuthorById(id: string): Promise<Author | null> {
    const authors = await this.getAuthors();
    return authors.find(author => author.id === id) || null;
  }

  async createAuthor(authorData: Omit<Author, 'id' | 'createdAt' | 'updatedAt'>): Promise<Author> {
    const authors = await this.getAuthors();
    
    const newAuthor: Author = {
      ...authorData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    authors.push(newAuthor);
    localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(authors));
    return newAuthor;
  }

  async updateAuthor(id: string, updates: Partial<Author>): Promise<Author | null> {
    const authors = await this.getAuthors();
    const index = authors.findIndex(author => author.id === id);
    
    if (index === -1) return null;

    const updatedAuthor = {
      ...authors[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    authors[index] = updatedAuthor;
    localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(authors));
    return updatedAuthor;
  }

  // Utility methods
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }
}

export const blogService = new BlogService();