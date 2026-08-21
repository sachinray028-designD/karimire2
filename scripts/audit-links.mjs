#!/usr/bin/env node
/**
 * Internal link audit.
 * Reads all dist/*.html files, extracts same-domain <a href>, builds an
 * adjacency map, and reports orphan pages, thin pages, and max click depth.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');
const ORIGIN = 'https://www.karimi.ae';

/** Recursively find all index.html files in dist/ */
function findHtmlFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) {
      findHtmlFiles(full, files);
    } else if (entry === 'index.html') {
      files.push(full);
    }
  }
  return files;
}

/** Normalise a path to a canonical route */
function toRoute(filePath) {
  const rel = relative(DIST, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace('/index.html', '');
}

/** Extract same-domain hrefs from HTML */
function extractLinks(html) {
  const links = new Set();
  const regex = /href="([^"]+)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    let href = match[1];
    // Remove origin prefix
    if (href.startsWith(ORIGIN)) href = href.slice(ORIGIN.length);
    // Only internal links
    if (!href.startsWith('/')) continue;
    // Skip assets, anchors, admin
    if (href.startsWith('/assets/')) continue;
    if (href.startsWith('/admin')) continue;
    if (href.includes('.xml') || href.includes('.txt') || href.includes('.png') || href.includes('.ico')) continue;
    // Normalise: remove trailing slash, hash, query
    href = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
    links.add(href);
  }
  return links;
}

function run() {
  const htmlFiles = findHtmlFiles(DIST);
  
  // Build page set and adjacency map
  const pages = new Map(); // route -> Set of outbound routes
  const inbound = new Map(); // route -> Set of source routes
  
  // Skip admin and non-public pages
  for (const file of htmlFiles) {
    const route = toRoute(file);
    if (route.startsWith('/admin')) continue;
    const html = readFileSync(file, 'utf8');
    const links = extractLinks(html);
    pages.set(route, links);
    
    if (!inbound.has(route)) inbound.set(route, new Set());
    for (const link of links) {
      if (!inbound.has(link)) inbound.set(link, new Set());
      inbound.get(link).add(route);
    }
  }
  
  // Report
  console.log(`\n=== INTERNAL LINK AUDIT ===`);
  console.log(`Total public pages: ${pages.size}`);
  
  // Orphan pages (0 inbound, excluding homepage)
  const orphans = [];
  const thin = []; // < 3 inbound
  for (const [route] of pages) {
    const count = inbound.get(route)?.size || 0;
    if (route === '/') continue;
    if (count === 0) orphans.push(route);
    else if (count < 3) thin.push({ route, count });
  }
  
  console.log(`\nOrphan pages (0 inbound): ${orphans.length}`);
  orphans.sort().forEach(r => console.log(`  ${r}`));
  
  console.log(`\nThin pages (<3 inbound): ${thin.length}`);
  thin.sort((a, b) => a.count - b.count).forEach(({ route, count }) => 
    console.log(`  ${route} (${count} inbound)`)
  );
  
  // Max click depth via BFS from homepage
  const depths = new Map();
  depths.set('/', 0);
  const queue = ['/'];
  while (queue.length > 0) {
    const current = queue.shift();
    const currentDepth = depths.get(current);
    const outLinks = pages.get(current) || new Set();
    for (const link of outLinks) {
      if (!depths.has(link) && pages.has(link)) {
        depths.set(link, currentDepth + 1);
        queue.push(link);
      }
    }
  }
  
  let maxDepth = 0;
  let deepest = '/';
  const unreachable = [];
  for (const [route] of pages) {
    if (!depths.has(route)) {
      unreachable.push(route);
    } else {
      const d = depths.get(route);
      if (d > maxDepth) { maxDepth = d; deepest = route; }
    }
  }
  
  console.log(`\nMax click depth from homepage: ${maxDepth} (${deepest})`);
  if (unreachable.length > 0) {
    console.log(`Unreachable from homepage: ${unreachable.length}`);
    unreachable.forEach(r => console.log(`  ${r}`));
  }
  
  // Summary stats
  const allInboundCounts = [...pages.keys()].map(r => inbound.get(r)?.size || 0);
  const avg = (allInboundCounts.reduce((a, b) => a + b, 0) / allInboundCounts.length).toFixed(1);
  console.log(`\nAverage inbound links per page: ${avg}`);
  console.log(`Pages at depth 1: ${[...depths.values()].filter(d => d === 1).length}`);
  console.log(`Pages at depth 2: ${[...depths.values()].filter(d => d === 2).length}`);
  console.log(`Pages at depth 3: ${[...depths.values()].filter(d => d === 3).length}`);
  console.log(`Pages at depth 4+: ${[...depths.values()].filter(d => d >= 4).length}`);
}

run();
