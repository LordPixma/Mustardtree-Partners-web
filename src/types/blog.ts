export interface Author {
  id: string;
  name: string;
  bio: string;
  email: string;
  headshot?: string;
  position?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorId: string;
  author?: Author;
  featuredImage?: string;
  images?: string[];
  videoUrl?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // SEO fields
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
  
  // Content fields
  tags?: string[];
  category?: string;
  readingTime?: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'editor';
  lastLogin?: string;
  createdAt: string;
}

export interface BlogState {
  posts: BlogPost[];
  authors: Author[];
  isAuthenticated: boolean;
  currentUser?: AdminUser;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  featuredImage?: string;
  videoUrl?: string;
  tags?: string[];
  category?: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  status: 'draft' | 'published';
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}