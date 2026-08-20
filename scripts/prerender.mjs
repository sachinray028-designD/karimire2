#!/usr/bin/env node
/**
 * Build-time prerenderer.
 * Builds a server bundle, fetches Supabase data, renders every public route
 * to static HTML, and writes the result into dist/.
 */
import { build as viteBuild } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { config as loadEnv } from 'dotenv';

loadEnv();


/**
 * The host that actually serves a 200. karimi.ae 301-redirects to www.karimi.ae.
 * `seo_global.site_url` in Supabase currently stores the bare domain, so we
 * normalise rather than trust it — a sitemap full of redirecting URLs wastes
 * crawl budget and muddies canonicalisation.
 */
const CANONICAL_ORIGIN = 'https://www.karimi.ae';

function toCanonicalUrl(value, fallbackPath = '/') {
  try {
    const u = new URL(String(value || '').trim() || fallbackPath, CANONICAL_ORIGIN);
    return `${CANONICAL_ORIGIN}${u.pathname}${u.search}`;
  } catch {
    return `${CANONICAL_ORIGIN}${fallbackPath}`;
  }
}

const DIST = resolve(process.cwd(), 'dist');
const DIST_SERVER = resolve(process.cwd(), 'dist-server');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Static public routes (no dynamic params)
const STATIC_ROUTES = [
  '/',
  '/properties',
  '/developers',
  '/insights',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

async function fetchData() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('[prerender] Supabase env vars missing; rendering with defaults only.');
    return {
      properties: [],
      developers: [],
      testimonials: [],
      blogPosts: [],
      siteContent: {},
      pageSeo: {},
      seoGlobal: null,
    };
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

  const [props, devs, testim, posts, content, pseo, gseo] = await Promise.all([
    sb.from('properties').select('*').eq('active', true),
    sb.from('developers').select('*').eq('active', true),
    sb.from('testimonials').select('*').eq('active', true),
    sb.from('blog_posts').select('*').eq('published', true).order('created_at', { ascending: false }),
    sb.from('site_content').select('key,value'),
    sb.from('page_seo').select('*'),
    sb.from('seo_global').select('*').eq('id', 'singleton').maybeSingle(),
  ]);

  const siteContent = {};
  for (const row of content.data || []) siteContent[row.key] = row.value;

  const pageSeo = {};
  for (const row of pseo.data || []) pageSeo[row.page_key] = row;

  return {
    properties: props.data || [],
    developers: devs.data || [],
    testimonials: testim.data || [],
    blogPosts: posts.data || [],
    siteContent,
    pageSeo,
    seoGlobal: gseo.data || null,
  };
}

/**
 * Remove static head tags from the index.html template that the app will replace.
 * Without this, every page gets duplicate title, canonical, description, etc.
 */
function stripManagedHeadTags(html) {
  return html
    // <title>...</title>
    .replace(/<title>[^<]*<\/title>\s*/g, '')
    // <meta name="description" ...>
    .replace(/<meta\s+name="description"[^>]*\/?\s*>\s*/g, '')
    // <meta name="robots" ...>
    .replace(/<meta\s+name="robots"[^>]*\/?\s*>\s*/g, '')
    // <meta name="googlebot" ...>
    .replace(/<meta\s+name="googlebot"[^>]*\/?\s*>\s*/g, '')
    // <meta property="og:..." ...>
    .replace(/<meta\s+property="og:[^"]*"[^>]*\/?\s*>\s*/g, '')
    // <meta name="twitter:..." ...>
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*\/?\s*>\s*/g, '')
    // <link rel="canonical" ...>
    .replace(/<link\s+rel="canonical"[^>]*\/?\s*>\s*/g, '')
    // <script type="application/ld+json">...</script>
    .replace(/<script\s+type="application\/ld\+json">[^]*?<\/script>\s*/g, '');
}

async function run() {
  console.log('[prerender] Building server bundle...');

  // Build the server bundle
  await viteBuild({
    build: {
      ssr: true,
      outDir: DIST_SERVER,
      rollupOptions: {
        input: resolve(process.cwd(), 'src/entry-server.tsx'),
      },
    },
    ssr: {
      noExternal: true,
    },
    logLevel: 'warn',
  });

  // Load the server bundle
  const serverEntry = pathToFileURL(resolve(DIST_SERVER, 'entry-server.js')).href;
  const { render } = await import(serverEntry);

  // Fetch data
  console.log('[prerender] Fetching Supabase data...');
  const ssgData = await fetchData();

  // Read the client-built template
  const rawTemplate = readFileSync(resolve(DIST, 'index.html'), 'utf-8');

  // Determine all routes
  const routes = [...STATIC_ROUTES];
  for (const p of ssgData.properties) {
    routes.push(`/properties/${p.slug}`);
  }
  for (const p of ssgData.blogPosts) {
    routes.push(`/insights/${p.slug}`);
  }

  // Topic cluster hub pages
  const CLUSTER_SLUGS = [
    'international-investor-journey',
    'market-analysis',
    'off-plan-buyer-protection',
    'transaction-mechanics-legal',
    'ownership-yield',
    'area-community-guides',
  ];
  for (const slug of CLUSTER_SLUGS) {
    routes.push(`/insights/topic/${slug}`);
  }

  console.log(`[prerender] Rendering ${routes.length} routes...`);

  // Serialize SSG data for injection (shared across all pages)
  // Escape < to prevent </script> in content from breaking out of the tag
  const ssgPayload = JSON.stringify(ssgData).replace(/</g, '\\u003c');

  let rendered = 0;

  for (const route of routes) {
    try {
      const { html, head } = render(route, ssgData);

      // Strip static head tags that the app will replace —
      // without this, every page gets duplicate title, canonical, description, etc.
      let page = stripManagedHeadTags(rawTemplate);

      // Inject prerendered HTML into #root
      page = page.replace(
        '<div id="root"></div>',
        `<div id="root">${html}</div>`
      );

      // Inject SSG data payload before </body>
      page = page.replace(
        '</body>',
        `<script>window.__SSG_DATA__=${ssgPayload}</script>\n</body>`
      );

      // Inject head tags at the marker (or before </head>)
      if (head) {
        if (page.includes('<!--SSG_HEAD-->')) {
          page = page.replace('<!--SSG_HEAD-->', head);
        } else {
          page = page.replace('</head>', `${head}\n</head>`);
        }
      }

      // Determine output path
      let outPath;
      if (route === '/') {
        outPath = resolve(DIST, 'index.html');
      } else {
        const dir = resolve(DIST, route.slice(1));
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        outPath = resolve(dir, 'index.html');
      }

      writeFileSync(outPath, page);
      rendered++;
    } catch (err) {
      console.warn(`[prerender] Failed to render ${route}:`, err?.message || err);
    }
  }

  // Fail loudly if nothing rendered — a silent green deploy with empty pages
  // is worse than a red build you can investigate
  if (rendered === 0) {
    console.error('[prerender] FATAL: zero routes rendered successfully.');
    process.exit(1);
  }

  // Sanity check: homepage should have meaningful content
  const homeHtml = readFileSync(resolve(DIST, 'index.html'), 'utf-8');
  // Measure the whole #root subtree. `(.*?)</div>` stops at the first closing
  // tag of the first nested element, so it reports a few hundred characters
  // whether or not the page rendered — and can fail a good build as easily as
  // it can pass a broken one.
  const rootStart = homeHtml.indexOf('<div id="root"');
  const rootEnd = homeHtml.indexOf('<script>window.__SSG_DATA__');
  const rootHtml = rootStart === -1 ? '' : homeHtml.slice(rootStart, rootEnd === -1 ? undefined : rootEnd);
  const visibleText = rootHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const bodyLen = visibleText.length;

  if (bodyLen < 500 || !/<h1[\s>]/.test(rootHtml)) {
    console.error(
      `[prerender] FATAL: homepage rendered ${bodyLen} chars of text and ` +
        `${/<h1[\s>]/.test(rootHtml) ? 'an' : 'NO'} <h1> — prerender did not produce a real page.`,
    );
    process.exit(1);
  }

  console.log(`[prerender] Rendered ${rendered}/${routes.length} routes (${bodyLen} chars on homepage).`);

  // Generate llms.txt with dynamic content
  generateLlmsTxt(ssgData);
}

function generateLlmsTxt(data) {
  const siteUrl = CANONICAL_ORIGIN;

  let txt = `# Karimi Real Estate LLC\n
> RERA-registered, zero-commission luxury property advisory in Dubai, United Arab Emirates. We represent international buyers acquiring off-plan and ready homes directly from leading Dubai developers.\n
Karimi Real Estate LLC is a licensed real estate brokerage based in Business Bay, Dubai.
Our advisory fee is paid by the developer, not the buyer, so clients pay zero commission.
We specialise in off-plan and ready freehold property, UAE Golden Visa qualification through
property ownership, and yield-focused portfolio construction for overseas investors.\n
## Key facts\n
- Location: 8th Floor, Office 0810, Tamani Art Tower, Al Asayel Street, Business Bay, Dubai, UAE
- Contact: info@karimi.ae, +971 52 868 0423
- Regulation: RERA-registered under the Dubai Land Department
- Commission charged to buyers: none (developer-funded model)
- Golden Visa property threshold: AED 2,000,000 in equity
- Foreign ownership: freehold available to all nationalities in designated Dubai zones
- Recurring property tax in the UAE: none (one-time 4% DLD transfer fee applies)\n
## Core pages\n
- [Home](${siteUrl}/): Zero-commission Dubai property advisory overview
- [Properties](${siteUrl}/properties): Searchable portfolio of off-plan and ready Dubai homes
- [Developers](${siteUrl}/developers): Emaar, DAMAC, Sobha, Nakheel, Omniyat, Meraas and other partners
- [Insights](${siteUrl}/insights): Research and guides on the Dubai property market
- [About](${siteUrl}/about): Advisory model, team and regulatory standing
- [Contact](${siteUrl}/contact): Book a consultation with a RERA-certified advisor\n`;

  // Add topic clusters
  txt += `\n## Topic clusters\n
- [International Investor Journey](${siteUrl}/insights/topic/international-investor-journey): Guides for non-UAE buyers — Golden Visa, tax structuring, remote purchase, step-by-step process
- [Market Analysis](${siteUrl}/insights/topic/market-analysis): Data-driven analysis — bubble risk, rental yields, population growth, global comparisons
- [Off-Plan & Buyer Protection](${siteUrl}/insights/topic/off-plan-buyer-protection): Developer evaluation, escrow accounts, payment plans, Oqood, snagging, delay rights
- [Transaction Mechanics & Legal](${siteUrl}/insights/topic/transaction-mechanics-legal): Freehold vs leasehold, ownership structure, mortgages, POA, Ejari, DIFC wills
- [Ownership & Yield](${siteUrl}/insights/topic/ownership-yield): Service charges, property management, exit strategy, portfolio building, branded residences
- [Area & Community Guides](${siteUrl}/insights/topic/area-community-guides): Dubai Creek Harbour, JVC, prime villas, Dubai South — investor-grade area assessments\n`;

  // Add articles
  if (data.blogPosts.length > 0) {
    txt += `\n## Published articles\n\n`;
    for (const post of data.blogPosts) {
      txt += `- [${post.title}](${siteUrl}/insights/${post.slug})\n`;
    }
  }

  // Add properties
  if (data.properties.length > 0) {
    txt += `\n## Property portfolio\n\n`;
    for (const prop of data.properties) {
      txt += `- [${prop.project_name}](${siteUrl}/properties/${prop.slug}): ${prop.location}, ${prop.status}\n`;
    }
  }

  txt += `\n## Authoritative sources we cite\n
- Dubai Land Department: https://dubailand.gov.ae/en/
- UAE Golden Visa (official): https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa
- Dubai Pulse open transaction data: https://www.dubaipulse.gov.ae/organisation/dld
- Central Bank of the UAE: https://www.centralbank.ae/en/\n`;

  writeFileSync(resolve(DIST, 'llms.txt'), txt);
  console.log(`[prerender] Wrote llms.txt (${data.blogPosts.length} articles, ${data.properties.length} properties).`);
}

run().catch((err) => {
  console.error('[prerender] Fatal error:', err);
  process.exit(1);
});
