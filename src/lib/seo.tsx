import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Helmet } from './helmet';
import { supabase } from './supabase';
import { getSSGData } from './ssgData';
import { useT } from './content';

export type SeoGlobal = {
  site_name: string;
  site_url: string;
  default_title: string;
  default_description: string;
  default_og_image: string;
  default_og_image_mobile: string;
  twitter_handle: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  ga4_id: string;
  gtm_id: string;
  facebook_pixel_id: string;
  google_verification: string;
  bing_verification: string;
  default_robots: string;
  robots_txt: string;
  organization_jsonld: string;
  local_business_jsonld: string;
  hreflang_json: string;
};

export type PageSeo = {
  page_key: string;
  route: string;
  title: string;
  description: string;
  canonical: string;
  robots: string;
  keywords: string;
  og_title: string;
  og_description: string;
  og_image_desktop: string;
  og_image_mobile: string;
  twitter_card: string;
  focus_keyword: string;
  schema_jsonld: string;
  head_extra: string;
};

const DEFAULT_GLOBAL: SeoGlobal = {
  site_name: 'Karimi Real Estate',
  site_url: 'https://www.karimi.ae',
  default_title: 'Karimi Real Estate | Dubai Luxury Property Advisory',
  default_description:
    'Zero-commission advisory for luxury Dubai property. Direct developer allocations, Golden Visa guidance, and data-driven investment counsel.',
  default_og_image: 'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=1200',
  default_og_image_mobile: '',
  twitter_handle: '@karimiuae',
  facebook_url: '',
  instagram_url: '',
  linkedin_url: '',
  youtube_url: '',
  ga4_id: '',
  gtm_id: '',
  facebook_pixel_id: '',
  google_verification: '',
  bing_verification: '',
  default_robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
  robots_txt: '',
  organization_jsonld: '',
  local_business_jsonld: '',
  hreflang_json: '[]',
};

const PAGE_DEFAULTS: Record<string, { title: string; description: string; route: string }> = {
  home: {
    title: 'Buy Luxury Property in Dubai | Zero-Commission Advisory | Karimi Real Estate',
    description: 'Karimi Real Estate LLC offers zero-commission advisory for luxury Dubai property. Direct developer allocations, Golden Visa guidance, and data-driven investment counsel for international buyers.',
    route: '/',
  },
  properties: {
    title: 'Dubai Properties for Sale | Off-Plan & Ready Homes | Karimi Real Estate',
    description: 'Browse curated Dubai properties for sale: luxury apartments, villas, townhouses and off-plan launches across Downtown, Palm Jumeirah, Marina, Business Bay and more.',
    route: '/properties',
  },
  developers: {
    title: 'Official Dubai Developer Partners | Emaar, DAMAC, Sobha | Karimi Real Estate',
    description: 'Direct allocations with 40+ official Dubai developer partners including Emaar, DAMAC, Nakheel, Sobha, Omniyat, Meraas and more. Zero buyer commission.',
    route: '/developers',
  },
  insights: {
    title: 'Dubai Property Market Insights & Investment Guides | Karimi Real Estate',
    description: 'Expert analysis on Dubai real estate: market trends, area guides, rental yield reports, Golden Visa updates and investor-grade research from RERA-certified advisors.',
    route: '/insights',
  },
  about: {
    title: 'About Karimi Real Estate | Dubai Advisory-First Property Firm',
    description: 'Karimi Real Estate is Dubai\'s advisory-first luxury property firm, trusted by clients from 32 countries. RERA-registered, zero-commission, counsel-driven approach.',
    route: '/about',
  },
  contact: {
    title: 'Contact Karimi Real Estate | Dubai Property Advisory',
    description: 'Speak to a senior Karimi advisor. Office in Business Bay, Dubai. Phone, WhatsApp, email or book a private consultation. RERA-certified team.',
    route: '/contact',
  },
  privacy: {
    title: 'Privacy Policy | Karimi Real Estate',
    description: 'How Karimi Real Estate LLC collects, uses and protects your personal data under UAE data protection law.',
    route: '/privacy',
  },
  terms: {
    title: 'Terms of Service | Karimi Real Estate',
    description: 'Terms governing use of the Karimi Real Estate website and advisory services in Dubai, UAE.',
    route: '/terms',
  },
  notfound: {
    title: 'Page Not Found | Karimi Real Estate',
    description: 'The page you were looking for does not exist. Browse our Dubai properties or return to the home page.',
    route: '/404',
  },
};

const SeoCtx = createContext<{
  global: SeoGlobal;
  pages: Record<string, PageSeo>;
  loaded: boolean;
  refresh: () => Promise<void>;
}>({
  global: DEFAULT_GLOBAL,
  pages: {},
  loaded: false,
  refresh: async () => {},
});

export function SeoProvider({ children }: { children: ReactNode }) {
  const ssg = getSSGData();
  const [global, setGlobal] = useState<SeoGlobal>(ssg?.seoGlobal || DEFAULT_GLOBAL);
  const [pages, setPages] = useState<Record<string, PageSeo>>(ssg?.pageSeo || {});
  const [loaded, setLoaded] = useState(!!ssg);

  const refresh = useCallback(async () => {
    const [g, p] = await Promise.all([
      supabase.from('seo_global').select('*').eq('id', 'singleton').maybeSingle(),
      supabase.from('page_seo').select('*'),
    ]);
    if (g.data) setGlobal({ ...DEFAULT_GLOBAL, ...(g.data as Partial<SeoGlobal>) });
    if (p.data) {
      const map: Record<string, PageSeo> = {};
      for (const row of p.data as PageSeo[]) map[row.page_key] = row;
      setPages(map);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <SeoCtx.Provider value={{ global, pages, loaded, refresh }}>{children}</SeoCtx.Provider>;
}

export function useSeoContext() {
  return useContext(SeoCtx);
}

/**
 * The host that actually serves a 200. karimi.ae 301-redirects to www.karimi.ae,
 * so www is the canonical origin.
 *
 * Everything absolute is forced through here because the values stored in
 * Supabase (`seo_global.site_url` and every `page_seo.canonical` row) currently
 * point at the bare domain. Declaring a canonical that immediately redirects is
 * a conflicting signal, so we normalise rather than trust the stored value.
 *
 * If the redirect is ever flipped to prefer the bare domain, change this one
 * constant.
 */
export const CANONICAL_ORIGIN = 'https://www.karimi.ae';

export function toCanonicalUrl(value: string | undefined, fallbackPath = '/'): string {
  const raw = (value || '').trim();
  try {
    const u = new URL(raw || fallbackPath, CANONICAL_ORIGIN);
    return `${CANONICAL_ORIGIN}${u.pathname}${u.search}`;
  } catch {
    return `${CANONICAL_ORIGIN}${fallbackPath}`;
  }
}

export function useSiteUrl() {
  return CANONICAL_ORIGIN;
}

export function buildOrgSchema(global: SeoGlobal, t: (key: string, fallback?: string) => string) {
  const site = CANONICAL_ORIGIN;

  // The logo comes from the CMS and may be a site-relative path or an absolute
  // Supabase storage URL (what the admin media uploader writes). Blindly
  // prefixing the origin turns the latter into "https://www.karimi.aehttps://…".
  const rawLogo = t('global.logo.header', '/karimi-logo_copy.png');
  const logoUrl = /^https?:\/\//i.test(rawLogo)
    ? rawLogo
    : `${site}${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${site}/#organization`,
    name: 'Karimi Real Estate LLC',
    url: site,
    logo: { '@type': 'ImageObject', url: logoUrl },
    image: logoUrl,
    description: global.default_description,
    telephone: t('global.topbar.phone', '+971 52 868 0423'),
    email: t('global.topbar.email', 'info@karimi.ae'),
    address: {
      '@type': 'PostalAddress',
      streetAddress: t('footer.contact.address', '8th Floor, Office No. 0810, Tamani Art Tower, Al Asayel Street, Business Bay, Dubai'),
      addressLocality: 'Dubai',
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    areaServed: {
      '@type': 'City',
      name: 'Dubai',
    },
    knowsAbout: ['Dubai Real Estate', 'Luxury Property', 'Off-Plan Investment', 'Golden Visa UAE'],
    sameAs: [
      t('social.linkedin.url', 'https://linkedin.com/company/karimi-real-estate'),
      t('social.instagram.url', 'https://instagram.com/karimirealestate'),
      t('social.facebook.url', 'https://facebook.com/karimirealestate'),
      t('social.twitter.url', 'https://x.com/karimirealestate'),
    ].filter(Boolean),
  };
}

type SeoProps = {
  page: string;
  titleOverride?: string;
  descriptionOverride?: string;
  canonicalOverride?: string;
  imageOverride?: string;
  jsonLd?: object | object[];
  breadcrumbs?: { name: string; url: string }[];
  article?: { publishedTime?: string; modifiedTime?: string; author?: string };
  noindex?: boolean;
};

function safeJson(raw: string): object | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function Seo({
  page,
  titleOverride,
  descriptionOverride,
  canonicalOverride,
  imageOverride,
  jsonLd,
  breadcrumbs,
  article,
  noindex,
}: SeoProps) {
  const { global, pages } = useSeoContext();
  const ps = pages[page];
  const t = useT();

  let description = descriptionOverride || ps?.description || global.default_description;
  if (!description || description.length < 80) {
    description = PAGE_DEFAULTS[page]?.description || description;
  }
  const title = titleOverride || ps?.title || PAGE_DEFAULTS[page]?.title || global.default_title;
  const site = CANONICAL_ORIGIN;
  const fallbackRoute = PAGE_DEFAULTS[page]?.route;
  const routePath = ps?.route || fallbackRoute;
  // Normalised, so a stored canonical on the redirecting host cannot win.
  const canonical = toCanonicalUrl(
    canonicalOverride || ps?.canonical || routePath || '/',
    '/',
  );
  const robots = noindex ? 'noindex,nofollow' : ps?.robots || global.default_robots;
  const keywords = ps?.keywords || '';
  const ogTitle = ps?.og_title || title;
  const ogDescription = ps?.og_description || description;
  const ogImage = imageOverride || ps?.og_image_desktop || global.default_og_image;
  const ogImageMobile = ps?.og_image_mobile || global.default_og_image_mobile || ogImage;
  const twitterCard = ps?.twitter_card || 'summary_large_image';

  const schemas: object[] = [];
  const sOverride = ps?.schema_jsonld ? safeJson(ps.schema_jsonld) : null;
  if (sOverride) schemas.push(sOverride);
  if (jsonLd) {
    if (Array.isArray(jsonLd)) schemas.push(...jsonLd);
    else schemas.push(jsonLd);
  }
  const orgLd = safeJson(global.organization_jsonld);
  const lbLd = safeJson(global.local_business_jsonld);
  if (orgLd) schemas.push(orgLd);
  if (lbLd) schemas.push(lbLd);

  if (page === 'home') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: global.site_name,
      url: global.site_url,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${global.site_url}/properties?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });
  }

  // Emit business identity on every page
  schemas.push(buildOrgSchema(global, t));

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        // Schema.org requires an absolute URL here. Relative paths like "/about"
        // are invalid and Google discards the breadcrumb rich result.
        item: /^https?:\/\//i.test(b.url)
          ? b.url
          : `${site}${b.url.startsWith('/') ? '' : '/'}${b.url}`,
      })),
    });
  }

  return (
    <Helmet>
      <html lang="en" />
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />
      <meta name="theme-color" content="#0b1c3a" />
      <meta name="author" content={global.site_name} />

      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:site_name" content={global.site_name} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      {ogImageMobile && <meta property="og:image:alt" content={ogTitle} />}
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />
      {global.twitter_handle && <meta name="twitter:site" content={global.twitter_handle} />}
      {global.twitter_handle && <meta name="twitter:creator" content={global.twitter_handle} />}

      {article?.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
      {article?.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
      {article?.author && <meta property="article:author" content={article.author} />}

      {global.google_verification && <meta name="google-site-verification" content={global.google_verification} />}
      {global.bing_verification && <meta name="msvalidate.01" content={global.bing_verification} />}

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}

      {ps?.head_extra && ps.head_extra.trim() && (
        <script type="application/ld+json">{ps.head_extra}</script>
      )}
    </Helmet>
  );
}
