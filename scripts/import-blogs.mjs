import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

// Reads credentials from environment variables — never hardcode secrets
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables:');
  console.error('  SUPABASE_URL              — your Supabase project URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY  — service_role key (from Supabase Dashboard > Settings > API)');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BLOG_PACKAGE_DIR = process.argv[2];
if (!BLOG_PACKAGE_DIR) {
  console.error('Usage: node scripts/import-blogs.mjs <path-to-blog-package>');
  console.error('Example: node scripts/import-blogs.mjs ./karimi-blog-package');
  process.exit(1);
}

async function importBlogs() {
  console.log('Reading blogs_index.json...');
  const indexRaw = readFileSync(join(BLOG_PACKAGE_DIR, 'blogs_index.json'), 'utf-8');
  const index = JSON.parse(indexRaw);
  
  console.log('Reading internal-linking-map.md...');
  const linkMapRaw = readFileSync(join(BLOG_PACKAGE_DIR, 'internal-linking-map.md'), 'utf-8');

  // Parse linking map into cluster categories
  // A simple mapping heuristic based on internal-linking-map.md sections
  const getCategory = (slug) => {
    if (linkMapRaw.includes(`Cluster 1`) && linkMapRaw.substring(linkMapRaw.indexOf('Cluster 1'), linkMapRaw.indexOf('Cluster 2')).includes(slug)) return 'International Investor Journey';
    if (linkMapRaw.includes(`Cluster 2`) && linkMapRaw.substring(linkMapRaw.indexOf('Cluster 2'), linkMapRaw.indexOf('Cluster 3')).includes(slug)) return 'Market Analysis';
    if (linkMapRaw.includes(`Cluster 3`) && linkMapRaw.substring(linkMapRaw.indexOf('Cluster 3'), linkMapRaw.indexOf('Cluster 4')).includes(slug)) return 'Off-Plan & Buyer Protection';
    if (linkMapRaw.includes(`Cluster 4`) && linkMapRaw.substring(linkMapRaw.indexOf('Cluster 4'), linkMapRaw.indexOf('Cluster 5')).includes(slug)) return 'Transaction Mechanics & Legal';
    if (linkMapRaw.includes(`Cluster 5`) && linkMapRaw.substring(linkMapRaw.indexOf('Cluster 5'), linkMapRaw.indexOf('Cluster 6')).includes(slug)) return 'Ownership & Yield';
    if (linkMapRaw.includes(`Cluster 6`) && linkMapRaw.substring(linkMapRaw.indexOf('Cluster 6')).includes(slug)) return 'Area & Community Guides';
    return 'Market Analysis'; // Fallback
  };

  const blogFiles = readdirSync(join(BLOG_PACKAGE_DIR, 'blogs')).filter(f => f.endsWith('.md'));
  console.log(`Found ${blogFiles.length} markdown files.`);

  for (const file of blogFiles) {
    let content = readFileSync(join(BLOG_PACKAGE_DIR, 'blogs', file), 'utf-8');
    
    // Strip SEO Helper notes at bottom
    content = content.replace(/\*\*Word count:\*\*[\s\S]*$/, '').trim();
    // Strip Top Target Keywords if present
    content = content.replace(/^\*\*Target Keywords:\*\*.*$/m, '').trim();

    // Extract H1 as Title
    let title = '';
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
      // Optionally remove the H1 from body since InsightDetail renders it separately
      content = content.replace(/^#\s+(.+)$/m, '').trim(); 
    }

    // Match file to index using title similarity or fallback logic
    // The prompt says use blogs_index.json as source of truth for slug, etc.
    // The files are named like blog-1-something.md, we can try to match them sequentially or by parsing.
    // Since we don't have a direct filename map in index, we will use the index order assuming it matches blog-1 to blog-38
    const fileNumMatch = file.match(/blog-(\d+)-/);
    if (!fileNumMatch) continue;
    const idx = parseInt(fileNumMatch[1], 10) - 1;
    const meta = index[idx];

    if (!meta) {
      console.warn(`No metadata found for ${file} (idx: ${idx})`);
      continue;
    }

    if (!title) title = meta.seo_title; // fallback

    // Estimate Read Time (assume 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTime = `${Math.ceil(wordCount / 200)} MIN READ`;

    const postData = {
      slug: meta.url,
      title: title,
      excerpt: meta.meta_description, // fallback excerpt
      content: content,
      cover_image: 'https://images.pexels.com/photos/3787485/pexels-photo-3787485.jpeg?auto=compress&cs=tinysrgb&w=800', // Default brand image
      author: 'Karimi Advisory Desk',
      category: getCategory(meta.url),
      read_time: readTime,
      seo_title: meta.seo_title,
      meta_description: meta.meta_description,
      published: true
    };

    console.log(`Upserting ${postData.slug}...`);
    const { error } = await sb.from('blog_posts').upsert(postData, { onConflict: 'slug' });
    if (error) {
      console.error(`Error inserting ${postData.slug}:`, error);
    }
  }

  console.log('Import complete!');
}

importBlogs().catch(console.error);
