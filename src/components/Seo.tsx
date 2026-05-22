import { Helmet } from 'react-helmet-async';

/**
 * Single source of truth for SEO. Per-route <head> metadata is set with
 * react-helmet-async; the build-time prerender step (scripts/prerender.mjs)
 * snapshots the resulting DOM so crawlers and link-preview bots receive
 * fully-populated HTML rather than an empty SPA shell.
 */

// Canonical host — single, non-www. A 301 from www -> non-www should be
// configured at the Cloudflare layer (see docs / Phase 4 notes).
export const SITE_URL = 'https://mustardtreegroup.com';
export const SITE_NAME = 'MustardTree Partners';

const DEFAULT_TITLE = 'MustardTree Partners — Governance. Intelligence. Growth.';
const DEFAULT_DESCRIPTION =
  'Board-level governance, risk, and AI advisory — led by a practising enterprise security architect with a legal background. Independent counsel for organisations navigating regulation, technology, and growth.';
const OG_IMAGE = `${SITE_URL}/mustardtree_300.png`;

interface SeoProps {
  /** Page title (site name is appended automatically). Omit for the homepage. */
  title?: string;
  /** Meta description. Falls back to the default firm description. */
  description?: string;
  /** Route path beginning with "/", e.g. "/blog". Used for canonical + og:url. */
  path: string;
  /** Set true for private/auth routes that should not be indexed. */
  noindex?: boolean;
  /** Open Graph type — "website" (default) or "article" for blog posts. */
  type?: 'website' | 'article';
}

export function Seo({ title, description, path, noindex = false, type = 'website' }: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={OG_IMAGE} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Helmet>
  );
}

/**
 * Organization / ProfessionalService structured data for the homepage.
 * Only confirmed facts are included — no invented data.
 */
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: SITE_NAME,
    legalName: 'Mustardtree Partners Ltd',
    url: SITE_URL,
    logo: OG_IMAGE,
    image: OG_IMAGE,
    email: 'info@mustardtreegroup.com',
    description: DEFAULT_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '33A Great George Street',
      addressLocality: 'Leeds',
      postalCode: 'LS1 3BB',
      addressCountry: 'GB',
    },
    founder: {
      '@type': 'Person',
      name: 'Samuel Odekunle',
      jobTitle: 'Principal — Governance, Risk & Intelligence',
    },
    employee: {
      '@type': 'Person',
      name: 'Samuel Odekunle',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
