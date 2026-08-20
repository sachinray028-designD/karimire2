#!/usr/bin/env node
/**
 * Build-time SEO generator.
 * Reads from Supabase (page_seo, seo_global, properties, blog_posts) and writes
 * dist/sitemap.xml, dist/robots.txt, and dist/llms.txt. Designed to run as the
 * last step of `vite build` via the postbuild npm script.
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const DIST = resolve(process.cwd(), 'dist');
const FALLBACK_SITE = 'https://www.karimi.ae';

if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true });

// Comprehensive robots.txt with explicit AI crawler rules
function buildRobotsTxt(siteUrl) {
  return `# Karimi Real Estate — ${siteUrl}

User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/

# --- AI assistants & answer engines: explicitly welcome ---

User-agent: GPTBot
Allow: /
Disallow: /admin

User-agent: OAI-SearchBot
Allow: /
Disallow: /admin

User-agent: ChatGPT-User
Allow: /
Disallow: /admin

User-agent: ClaudeBot
Allow: /
Disallow: /admin

User-agent: Claude-User
Allow: /
Disallow: /admin

User-agent: Claude-SearchBot
Allow: /
Disallow: /admin

User-agent: anthropic-ai
Allow: /
Disallow: /admin

User-agent: PerplexityBot
Allow: /
Disallow: /admin

User-agent: Perplexity-User
Allow: /
Disallow: /admin

User-agent: Google-Extended
Allow: /
Disallow: /admin

User-agent: Applebot
Allow: /
Disallow: /admin

User-agent: Applebot-Extended
Allow: /
Disallow: /admin

User-agent: Bingbot
Allow: /
Disallow: /admin

User-agent: DuckAssistBot
Allow: /
Disallow: /admin

User-agent: CCBot
Allow: /
Disallow: /admin

User-agent: Meta-ExternalAgent
Allow: /
Disallow: /admin

User-agent: cohere-ai
Allow: /
Disallow: /admin

User-agent: YouBot
Allow: /
Disallow: /admin

Sitemap: ${siteUrl}/sitemap.xml
`;
}

function buildLlmsTxt(siteUrl, props, posts) {
  let txt = `# Karimi Real Estate LLC

> RERA-registered, zero-commission luxury property advisory in Dubai, United Arab Emirates. We represent international buyers acquiring off-plan and ready homes directly from leading Dubai developers.

Karimi Real Estate LLC is a licensed real estate brokerage based in Business Bay, Dubai.
Our advisory fee is paid by the developer, not the buyer, so clients pay zero commission.
We specialise in off-plan and ready freehold property, UAE Golden Visa qualification through
property ownership, and yield-focused portfolio construction for overseas investors.

## Key facts

- Location: 8th Floor, Office 0810, Tamani Art Tower, Al Asayel Street, Business Bay, Dubai, UAE
- Contact: info@karimi.ae, +971 52 868 0423
- Regulation: RERA-registered under the Dubai Land Department
- Commission charged to buyers: none (developer-funded model)
- Golden Visa property threshold: AED 2,000,000 in equity
- Foreign ownership: freehold available to all nationalities in designated Dubai zones
- Recurring property tax in the UAE: none (one-time 4% DLD transfer fee applies)

## Core pages

- [Home](${siteUrl}/): Zero-commission Dubai property advisory overview
- [Properties](${siteUrl}/properties): Searchable portfolio of off-plan and ready Dubai homes
- [Developers](${siteUrl}/developers): Emaar, DAMAC, Sobha, Nakheel, Omniyat, Meraas and other partners
- [Insights](${siteUrl}/insights): Research and guides on the Dubai property market
- [About](${siteUrl}/about): Advisory model, team and regulatory standing
- [Contact](${siteUrl}/contact): Book a consultation with a RERA-certified advisor
`;

  txt += `\n## Topic clusters\n
- [International Investor Journey](${siteUrl}/insights/topic/international-investor-journey): Guides for non-UAE buyers — Golden Visa, tax structuring, remote purchase, step-by-step process
- [Market Analysis](${siteUrl}/insights/topic/market-analysis): Data-driven analysis — bubble risk, rental yields, population growth, global comparisons
- [Off-Plan & Buyer Protection](${siteUrl}/insights/topic/off-plan-buyer-protection): Developer evaluation, escrow accounts, payment plans, Oqood, snagging, delay rights
- [Transaction Mechanics & Legal](${siteUrl}/insights/topic/transaction-mechanics-legal): Freehold vs leasehold, ownership structure, mortgages, POA, Ejari, DIFC wills
- [Ownership & Yield](${siteUrl}/insights/topic/ownership-yield): Service charges, property management, exit strategy, portfolio building, branded residences
- [Area & Community Guides](${siteUrl}/insights/topic/area-community-guides): Dubai Creek Harbour, JVC, prime villas, Dubai South — investor-grade area assessments
`;

  if (posts && posts.length > 0) {
    txt += `\n## Published articles\n\n`;
    for (const p of posts) {
      txt += `- [${p.title}](${siteUrl}/insights/${p.slug})\n`;
    }
  }

  if (props && props.length > 0) {
    txt += `\n## Property portfolio\n\n`;
    for (const p of props) {
      const loc = p.location || 'Dubai';
      const status = p.status || 'Off-Plan';
      txt += `- [${p.project_name}](${siteUrl}/properties/${p.slug}): ${loc}, ${status}\n`;
    }
  }

  txt += `\n## Authoritative sources we cite

- Dubai Land Department: https://dubailand.gov.ae/en/
- UAE Golden Visa (official): https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa
- Dubai Pulse open transaction data: https://www.dubaipulse.gov.ae/organisation/dld
- Central Bank of the UAE: https://www.centralbank.ae/en/
`;

  return txt;
}

async function run() {
  let siteUrl = FALLBACK_SITE;
  let robotsTxt = buildRobotsTxt(siteUrl);
  const urls = [];
  let allProps = [];
  let allPosts = [];

  if (SUPABASE_URL && SUPABASE_KEY) {
    const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
    try {
      const [{ data: g }, { data: pages }, { data: props }, { data: posts }] = await Promise.all([
        sb.from('seo_global').select('*').eq('id', 'singleton').maybeSingle(),
        sb.from('page_seo').select('page_key,route,canonical'),
        sb.from('properties').select('slug,created_at,project_name,location,status').eq('active', true),
        sb.from('blog_posts').select('slug,created_at,title').eq('published', true),
      ]);
      // Ignore a stored bare-domain origin; always emit the host that serves 200.
      siteUrl = CANONICAL_ORIGIN;
      // A robots.txt saved through the admin used to REPLACE the generated one,
      // silently discarding every AI-crawler directive and pointing the sitemap
      // at the redirecting host. Merge instead: keep the custom rules, then
      // append the AI agents and a correct Sitemap line.
      const custom = (g?.robots_txt || '').trim();
      if (custom) {
        const generated = buildRobotsTxt(siteUrl);
        const aiSection = generated.slice(generated.indexOf('# --- AI'));
        robotsTxt = `${custom.replace(/^\s*Sitemap:.*$/gim, '').trim()}\n\n${aiSection}`;
      } else {
        robotsTxt = buildRobotsTxt(siteUrl);
      }

      allProps = props || [];
      allPosts = posts || [];

      for (const p of pages || []) {
        if (!p.route || p.route === '*') continue;
        urls.push({ loc: p.canonical || `${siteUrl}${p.route}`, priority: p.route === '/' ? '1.0' : '0.8', changefreq: 'weekly' });
      }
      for (const p of allProps) {
        urls.push({
          loc: `${siteUrl}/properties/${p.slug}`,
          lastmod: p.created_at ? new Date(p.created_at).toISOString().slice(0, 10) : undefined,
          priority: '0.7',
          changefreq: 'weekly',
        });
      }
      for (const p of allPosts) {
        urls.push({
          loc: `${siteUrl}/insights/${p.slug}`,
          lastmod: p.created_at ? new Date(p.created_at).toISOString().slice(0, 10) : undefined,
          priority: '0.6',
          changefreq: 'monthly',
        });
      }

      // Topic cluster hub pages
      const clusterSlugs = [
        'international-investor-journey',
        'market-analysis',
        'off-plan-buyer-protection',
        'transaction-mechanics-legal',
        'ownership-yield',
        'area-community-guides',
      ];
      for (const slug of clusterSlugs) {
        urls.push({
          loc: `${siteUrl}/insights/topic/${slug}`,
          priority: '0.8',
          changefreq: 'weekly',
        });
      }
    } catch (err) {
      console.warn('[generate-seo] Supabase fetch failed, writing fallback sitemap.', err?.message || err);
    }
  } else {
    console.warn('[generate-seo] Supabase env missing; writing minimal fallback sitemap.');
  }

  if (urls.length === 0) {
    for (const route of ['/', '/properties', '/developers', '/insights', '/about', '/contact', '/privacy', '/terms']) {
      urls.push({ loc: `${siteUrl}${route}`, priority: route === '/' ? '1.0' : '0.8', changefreq: 'weekly' });
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => [
      '  <url>',
      `    <loc>${u.loc}</loc>`,
      u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : null,
      u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>` : null,
      u.priority ? `    <priority>${u.priority}</priority>` : null,
      '  </url>',
    ].filter(Boolean).join('\n')),
    '</urlset>',
    '',
  ].join('\n');

  writeFileSync(resolve(DIST, 'sitemap.xml'), xml);
  writeFileSync(resolve(DIST, 'robots.txt'), robotsTxt.endsWith('\n') ? robotsTxt : robotsTxt + '\n');

  // Write llms.txt — use prerender-generated version if it exists, otherwise generate
  const prerenderLlms = resolve(DIST, 'llms.txt');
  if (!existsSync(prerenderLlms)) {
    writeFileSync(prerenderLlms, buildLlmsTxt(siteUrl, allProps, allPosts));
    console.log(`[generate-seo] Wrote llms.txt (${allPosts.length} articles, ${allProps.length} properties).`);
  } else {
    console.log(`[generate-seo] llms.txt already exists (written by prerender), skipping.`);
  }

  console.log(`[generate-seo] Wrote ${urls.length} URLs to sitemap.xml + robots.txt`);
}

run().catch((err) => {
  console.error('[generate-seo] Failed:', err);
  process.exit(0);
});
