-- MustardTree Document Portal - D1 Database Schema

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  access_level TEXT NOT NULL DEFAULT 'read-write' CHECK(access_level IN ('read-only', 'read-write')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login TEXT
);

-- Folders table
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  parent_folder_id TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  customer_id TEXT NOT NULL,
  folder_id TEXT,
  current_version INTEGER NOT NULL DEFAULT 0,
  is_confidential INTEGER NOT NULL DEFAULT 0,
  tags TEXT, -- JSON array stored as text
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_accessed_at TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

-- Document versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  r2_key TEXT NOT NULL,
  checksum TEXT NOT NULL,
  change_note TEXT,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  UNIQUE(document_id, version)
);

-- Document access permissions table
CREATE TABLE IF NOT EXISTS document_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id TEXT NOT NULL,
  principal_id TEXT NOT NULL, -- user ID or customer ID
  permission TEXT NOT NULL CHECK(permission IN ('view', 'download', 'upload')),
  granted_by TEXT NOT NULL,
  granted_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  UNIQUE(document_id, principal_id, permission)
);

-- Document access audit log
CREATE TABLE IF NOT EXISTS access_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT,
  action TEXT NOT NULL CHECK(action IN ('view', 'download', 'upload', 'delete', 'permission_change')),
  ip_address TEXT,
  user_agent TEXT,
  details TEXT, -- JSON for extra context
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Share links for document sharing
CREATE TABLE IF NOT EXISTS share_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL UNIQUE,
  document_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_doc ON share_links(document_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_customer ON documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_doc ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_permissions_doc ON document_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_permissions_principal ON document_permissions(principal_id);
CREATE INDEX IF NOT EXISTS idx_access_log_doc ON access_log(document_id);
CREATE INDEX IF NOT EXISTS idx_access_log_user ON access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_access_log_timestamp ON access_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_folders_customer ON folders(customer_id);

-- Blog authors table
CREATE TABLE IF NOT EXISTS authors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  headshot TEXT,
  position TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  author_id TEXT NOT NULL,
  featured_image TEXT,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  category TEXT,
  tags TEXT, -- JSON array
  reading_time INTEGER,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT, -- JSON array
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (author_id) REFERENCES authors(id)
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);

-- Notification log
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- 'document_upload', 'document_shared', 'new_blog_post'
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed')),
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed default author
INSERT OR IGNORE INTO authors (id, name, bio, email, position)
VALUES ('1', 'MustardTree Team', 'The expert team at MustardTree Partners, providing insights on governance, compliance, and business intelligence.', 'info@mustardtreegroup.com', 'Editorial Team');

-- Seed default blog post
INSERT OR IGNORE INTO blog_posts (id, title, slug, excerpt, content, author_id, status, category, tags, reading_time, published_at)
VALUES ('1', 'Understanding Modern Corporate Governance', 'understanding-modern-corporate-governance', 'Explore the key principles and best practices of corporate governance.', 'Corporate governance has evolved significantly in recent years. Key principles include transparency, accountability, and fairness.', '1', 'published', 'Corporate Governance', '["Governance","Compliance","Best Practices"]', 5, '2025-01-01T00:00:00.000Z');

-- Seed default customer
INSERT OR IGNORE INTO customers (id, name, email, company, access_level, is_active)
VALUES ('customer-1', 'Acme Corporation', 'contact@acme.com', 'Acme Corporation', 'read-write', 1);
