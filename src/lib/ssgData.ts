import type { Property, Developer, Testimonial, BlogPost } from './supabase';
import type { SeoGlobal, PageSeo } from './seo';

declare global {
  interface Window {
    __SSG_DATA__?: SSGData;
  }
}

export interface SSGData {
  properties: Property[];
  developers: Developer[];
  testimonials: Testimonial[];
  blogPosts: BlogPost[];
  siteContent: Record<string, string>;
  pageSeo: Record<string, PageSeo>;
  seoGlobal: SeoGlobal | null;
}

let _data: SSGData | null = null;

export function setSSGData(data: SSGData) {
  _data = data;
}

export function getSSGData(): SSGData | null {
  if (_data) return _data;
  if (typeof window !== 'undefined' && window.__SSG_DATA__) {
    _data = window.__SSG_DATA__ as SSGData;
    return _data;
  }
  return null;
}
