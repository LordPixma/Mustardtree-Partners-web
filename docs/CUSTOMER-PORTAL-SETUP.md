# Customer Portal Documentation

## Overview

The MustardTree Partners Customer Portal is a secure document management system that allows customers to access sensitive documents shared by the company. It leverages Cloudflare's ecosystem for security, storage, and access control.

## Architecture

### Components

1. **Customer Portal** (`/portal`) - Customer-facing interface for document access
2. **Admin Document Management** (`/admin/documents`) - Staff interface for document management
3. **Document Service** - Core business logic for document operations
4. **Cloudflare Access** - Authentication and authorization
5. **Cloudflare R2** - Document storage with versioning

### Authentication Flow

```
Customer/Staff → Cloudflare Access → JWT Verification → Role Assignment → Portal Access
```

### Document Flow

```
Upload → R2 Storage → Metadata Storage → Version Control → Access Logging
```

## Features

### Customer Features
- View assigned documents
- Download documents
- Upload new versions (if permitted)
- Search and filter documents
- View document history

### Admin Features
- Manage customers
- Upload documents for customers
- Set document permissions
- View audit logs
- Manage document versions
- Delete documents (admin only)

### Security Features
- Cloudflare Access authentication
- Role-based access control (Admin, Staff, Customer)
- Document encryption at rest
- Audit logging for all actions
- Secure file upload validation
- Permission-based document access

## Cloudflare Setup

### 1. Cloudflare R2 Storage

```bash
# Create R2 bucket
wrangler r2 bucket create mustardtree-documents

# Set CORS policy
wrangler r2 bucket cors put mustardtree-documents --file cors.json
```

### 2. Cloudflare Access Policies

#### Customer Access Policy
- **Name**: Customer Portal Access
- **Subdomain**: `portal.mustardtreegroup.com`
- **Application Type**: Self-hosted
- **Allowed Groups**: Customers, Staff, Admins
- **Session Duration**: 24 hours

#### Admin Access Policy
- **Name**: Admin Portal Access  
- **Subdomain**: `admin.mustardtreegroup.com`
- **Application Type**: Self-hosted
- **Allowed Groups**: Staff, Admins
- **Session Duration**: 8 hours

### 3. Environment Variables

#### Production Environment Variables
```env
# Cloudflare Access
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_ACCESS_APPLICATION_AUD=your_app_aud_here

# Cloudflare R2
VITE_R2_BUCKET_NAME=mustardtree-documents
VITE_R2_ACCESS_KEY_ID=your_r2_access_key
VITE_R2_SECRET_ACCESS_KEY=your_r2_secret_key

# Domain Configuration
VITE_DOMAIN=mustardtreegroup.com

# API Configuration (for future backend integration)
VITE_API_BASE_URL=https://api.mustardtreegroup.com
```

## Deployment Setup

### 1. Cloudflare Pages Configuration

Add environment variables in Cloudflare Pages dashboard:

1. Go to Pages → Your Project → Settings → Environment variables
2. Add the variables listed above
3. Deploy the application

### 2. Domain Configuration

```bash
# Add subdomain records in Cloudflare DNS
portal.mustardtreegroup.com → CNAME → your-pages-url
admin.mustardtreegroup.com → CNAME → your-pages-url
```

### 3. Access Application Setup

1. **Create Customer Portal Application**:
   - Go to Zero Trust → Access → Applications
   - Add application → Self-hosted
   - Subdomain: `portal`
   - Domain: `mustardtreegroup.com`
   - Path: `/portal`

2. **Create Admin Portal Application**:
   - Subdomain: `admin` or use main domain with path `/admin`
   - Add policies for staff and admin access

### 4. R2 Bucket Setup

```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate with Cloudflare
wrangler auth login

# Create R2 bucket
wrangler r2 bucket create mustardtree-documents

# Create API token for R2 access
# Go to Cloudflare Dashboard → My Profile → API Tokens → Create Token
# Use "R2 Token" template or custom token with R2:Edit permissions
```

## User Roles and Permissions

### Customer Role
- **Groups**: `customer`, `client`
- **Permissions**:
  - View assigned documents
  - Download documents
  - Upload new versions (if document allows)
  - Cannot delete documents

### Staff Role
- **Groups**: `staff`, `employee`
- **Permissions**:
  - All customer permissions
  - Create new customers
  - Upload documents for any customer
  - View audit logs
  - Edit document metadata

### Admin Role
- **Groups**: `admin`, `administrator`
- **Permissions**:
  - All staff permissions
  - Delete documents and versions
  - Manage user permissions
  - Access all system functions

## Security Implementation

### Document Access Control
```typescript
interface DocumentPermissions {
  canView: string[];      // User IDs who can view
  canDownload: string[];  // User IDs who can download
  canUpload: string[];    // User IDs who can upload new versions
}
```

### Audit Logging
All document actions are logged with:
- User ID and email
- Action type (view, download, upload, delete)
- Timestamp
- IP address (when available)
- Document ID and version

### File Validation
- File size limits (100MB default)
- MIME type validation
- Virus scanning (planned)
- Content scanning for sensitive data (planned)

## Version Control

### Document Versioning
- Each upload creates a new version
- Previous versions are preserved
- Version metadata includes:
  - Version number
  - Upload timestamp
  - Uploader information
  - File size and checksum
  - Change notes

### Version Management
- Customers can view version history
- Staff can rollback to previous versions
- Admins can delete specific versions
- Current version is always the latest by default

## API Endpoints (Future Backend)

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `GET /api/documents/:id` - Get document details
- `GET /api/documents/:id/download` - Download document
- `PUT /api/documents/:id` - Update document metadata
- `DELETE /api/documents/:id` - Delete document

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Deactivate customer

### Audit
- `GET /api/audit` - Get audit log
- `GET /api/audit/documents/:id` - Get document audit log

## Migration from localStorage

The current implementation uses localStorage for data persistence. To migrate to a backend:

1. Replace `documentService.ts` methods with API calls
2. Update authentication to use backend sessions
3. Implement real-time updates with WebSockets
4. Add database schemas for documents, customers, and audit logs

## Monitoring and Analytics

### Metrics to Track
- Document upload/download counts
- User activity patterns
- Storage usage
- Authentication success/failure rates
- Performance metrics

### Alerting
- Failed authentication attempts
- Large file uploads
- Unusual access patterns
- Storage quota approaching limits

## Backup and Recovery

### R2 Backup Strategy
- Daily automated backups to separate bucket
- Version history preservation
- Cross-region replication for critical documents
- Point-in-time recovery capability

### Data Recovery Procedures
- Document corruption recovery
- Accidental deletion recovery
- Customer data export procedures
- Emergency access procedures