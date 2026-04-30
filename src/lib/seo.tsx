import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Helmet } from './helmet';
import { supabase } from './supabase';

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
  site_url: 'https://karimi.ae',
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
  default_robots: 'index,follow',
  robots_txt: '',
  organization_jsonld: '',
  local_business_jsonld: '',
  hreflang_json: '[]',
};

type Ctx = {
  global: SeoGlobal;
  pages: Record<string, PageSeo>;
  loaded: boolean;
  refresh: () => Promise<void>;
};

const SeoCtx = createContext<Ctx>({
  global: DEFAULT_GLOBAL,
  pages: {},
  loaded: false,
  refresh: async () => {},
});

export function SeoProvider({ children }: { children: ReactNode }) {
  const [global, setGlobal] = useState<SeoGlobal>(DEFAULT_GLOBAL);
  const [pages, setPages] = useState<Record<string, PageSeo>>({});
  const [loaded, setLoaded] = useState(false);

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

  const title = titleOverride || ps?.title || global.default_title;
  const description = descriptionOverride || ps?.description || global.default_description;
  const canonical =
    canonicalOverride ||
    ps?.canonical ||
    (ps?.route ? `${global.site_url.replace(/\/$/, '')}${ps.route}` : global.site_url);
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

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: b.url,
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
