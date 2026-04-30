#!/usr/bin/env node
/**
 * Build-time SEO generator.
 * Reads from Supabase (page_seo, seo_global, properties, blog_posts) and writes
 * dist/sitemap.xml and dist/robots.txt. Designed to run as the last step of
 * `vite build` via the postbuild npm script.
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const DIST = resolve(process.cwd(), 'dist');
const FALLBACK_SITE = 'https://karimi.ae';

if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true });

async function run() {
  let siteUrl = FALLBACK_SITE;
  let robotsTxt = `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${siteUrl}/sitemap.xml\n`;
  const urls = [];

  if (SUPABASE_URL && SUPABASE_KEY) {
    const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
    try {
      const [{ data: g }, { data: pages }, { data: props }, { data: posts }] = await Promise.all([
        sb.from('seo_global').select('*').eq('id', 'singleton').maybeSingle(),
        sb.from('page_seo').select('page_key,route,canonical'),
        sb.from('properties').select('slug,updated_at').eq('active', true),
        sb.from('blog_posts').select('slug,updated_at').eq('published', true),
      ]);
      if (g?.site_url) siteUrl = g.site_url.replace(/\/$/, '');
      if (g?.robots_txt && g.robots_txt.trim()) robotsTxt = g.robots_txt;

      for (const p of pages || []) {
        if (!p.route || p.route === '*') continue;
        urls.push({ loc: p.canonical || `${siteUrl}${p.route}`, priority: p.route === '/' ? '1.0' : '0.8', changefreq: 'weekly' });
      }
      for (const p of props || []) {
        urls.push({
          loc: `${siteUrl}/properties/${p.slug}`,
          lastmod: p.updated_at ? new Date(p.updated_at).toISOString().slice(0, 10) : undefined,
          priority: '0.7',
          changefreq: 'weekly',
        });
      }
      for (const p of posts || []) {
        urls.push({
          loc: `${siteUrl}/insights/${p.slug}`,
          lastmod: p.updated_at ? new Date(p.updated_at).toISOString().slice(0, 10) : undefined,
          priority: '0.6',
          changefreq: 'monthly',
        });
      }
    } catch (err) {
      console.warn('[generate-seo] Supabase fetch failed, writing fallback sitemap.', err?.message || err);
    }
  } else {
    console.warn('[generate-seo] Supabase env missing; writing minimal fallback sitemap.');
  }

  if (urls.length === 0) {
    for (const route of ['/', '/properties', '/developers', '/insights', '/about', '/contact']) {
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
  console.log(`[generate-seo] Wrote ${urls.length} URLs to sitemap.xml + robots.txt`);
}

run().catch((err) => {
  console.error('[generate-seo] Failed:', err);
  process.exit(0);
});
