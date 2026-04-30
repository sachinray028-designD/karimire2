/*
  # SEO Management + Media Library

  1. New Tables
    - `seo_global` — singleton table storing site-wide SEO defaults (title, description, OG image, GA/GTM IDs, Search Console verification, robots policy, social handles).
    - `page_seo` — one row per public route (keyed by page_key) storing page-level meta (title, description, canonical, robots, keywords, OG/Twitter fields, desktop/mobile OG images, focus keyword, JSON-LD schema override, extra head HTML).
    - `media_library` — uploaded asset catalog (id, desktop_url, mobile_url, webp_url, alt, width, height, size_bytes).
    - `page_sections` — visibility + ordering for each section of each page.

  2. Security
    - RLS enabled on every table.
    - Public (anon + authenticated) can read SEO + media + section order so the public site can render.
    - Only authenticated users (admin panel) can insert / update / delete.

  3. Notes
    - `seo_global` is enforced as single-row via a constant primary key = 'singleton'.
    - `page_seo.page_key` is the stable identifier (e.g. 'home', 'properties', 'about').
    - `media_library` URLs are expected to come from the Supabase Storage bucket `site-media`.
*/

CREATE TABLE IF NOT EXISTS seo_global (
  id text PRIMARY KEY DEFAULT 'singleton',
  site_name text NOT NULL DEFAULT 'Karimi Real Estate',
  site_url text NOT NULL DEFAULT 'https://karimi.ae',
  default_title text NOT NULL DEFAULT 'Karimi Real Estate | Dubai Luxury Property Advisory',
  default_description text NOT NULL DEFAULT 'Zero-commission advisory for luxury Dubai property. Direct developer allocations, Golden Visa guidance, and data-driven investment counsel.',
  default_og_image text NOT NULL DEFAULT '',
  default_og_image_mobile text NOT NULL DEFAULT '',
  twitter_handle text NOT NULL DEFAULT '@karimiuae',
  facebook_url text NOT NULL DEFAULT '',
  instagram_url text NOT NULL DEFAULT '',
  linkedin_url text NOT NULL DEFAULT '',
  youtube_url text NOT NULL DEFAULT '',
  ga4_id text NOT NULL DEFAULT '',
  gtm_id text NOT NULL DEFAULT '',
  facebook_pixel_id text NOT NULL DEFAULT '',
  google_verification text NOT NULL DEFAULT '',
  bing_verification text NOT NULL DEFAULT '',
  default_robots text NOT NULL DEFAULT 'index,follow',
  robots_txt text NOT NULL DEFAULT 'User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://karimi.ae/sitemap.xml',
  organization_jsonld text NOT NULL DEFAULT '',
  local_business_jsonld text NOT NULL DEFAULT '',
  hreflang_json text NOT NULL DEFAULT '[]',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seo_global_singleton CHECK (id = 'singleton')
);

INSERT INTO seo_global (id) VALUES ('singleton') ON CONFLICT (id) DO NOTHING;

ALTER TABLE seo_global ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='seo_global' AND policyname='Public read seo global') THEN
    CREATE POLICY "Public read seo global" ON seo_global FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='seo_global' AND policyname='Auth update seo global') THEN
    CREATE POLICY "Auth update seo global" ON seo_global FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='seo_global' AND policyname='Auth insert seo global') THEN
    CREATE POLICY "Auth insert seo global" ON seo_global FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS page_seo (
  page_key text PRIMARY KEY,
  route text NOT NULL DEFAULT '/',
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  canonical text NOT NULL DEFAULT '',
  robots text NOT NULL DEFAULT 'index,follow',
  keywords text NOT NULL DEFAULT '',
  og_title text NOT NULL DEFAULT '',
  og_description text NOT NULL DEFAULT '',
  og_image_desktop text NOT NULL DEFAULT '',
  og_image_mobile text NOT NULL DEFAULT '',
  twitter_card text NOT NULL DEFAULT 'summary_large_image',
  focus_keyword text NOT NULL DEFAULT '',
  schema_jsonld text NOT NULL DEFAULT '',
  head_extra text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_seo' AND policyname='Public read page seo') THEN
    CREATE POLICY "Public read page seo" ON page_seo FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_seo' AND policyname='Auth insert page seo') THEN
    CREATE POLICY "Auth insert page seo" ON page_seo FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_seo' AND policyname='Auth update page seo') THEN
    CREATE POLICY "Auth update page seo" ON page_seo FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_seo' AND policyname='Auth delete page seo') THEN
    CREATE POLICY "Auth delete page seo" ON page_seo FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

INSERT INTO page_seo (page_key, route, title, description, canonical, keywords, og_title, og_description, focus_keyword) VALUES
  ('home', '/', 'Buy Luxury Property in Dubai | Karimi Real Estate Advisory', 'Zero-commission advisory for luxury Dubai property. Direct developer allocations, Golden Visa guidance, and data-driven investment counsel for global buyers.', 'https://karimi.ae/', 'buy property dubai, luxury real estate dubai, dubai property investment, golden visa dubai, off-plan dubai', 'Buy Luxury Property in Dubai | Karimi Real Estate', 'Dubai''s advisory-first luxury property specialists. Direct developer access, zero buyer commission, Golden Visa pathways.', 'buy property dubai'),
  ('properties', '/properties', 'Dubai Properties for Sale | Apartments, Villas & Off-Plan | Karimi', 'Browse curated Dubai properties for sale: apartments, villas, townhouses and off-plan launches across Downtown, Palm Jumeirah, Marina, Business Bay and more.', 'https://karimi.ae/properties', 'dubai properties for sale, apartments dubai, villas dubai, off-plan dubai', 'Dubai Properties for Sale | Karimi Real Estate', 'Curated luxury properties across every prime Dubai address.', 'dubai properties for sale'),
  ('developers', '/developers', 'Official Dubai Developer Partners | Karimi Real Estate', 'Direct allocations with 40+ official Dubai developer partners including Emaar, Damac, Nakheel, Sobha, Omniyat and more.', 'https://karimi.ae/developers', 'dubai developers, emaar, damac, nakheel, sobha, omniyat', 'Official Dubai Developer Partners | Karimi', 'Preferential allocations with Dubai''s finest master developers.', 'dubai developers'),
  ('insights', '/insights', 'Dubai Real Estate Insights & Market Intelligence | Karimi', 'Expert analysis on Dubai real estate: market trends, area guides, yield reports, Golden Visa updates and investor-grade research.', 'https://karimi.ae/insights', 'dubai real estate market, dubai property insights, dubai yields', 'Dubai Real Estate Market Insights | Karimi', 'Data-driven Dubai property intelligence for discerning investors.', 'dubai real estate insights'),
  ('about', '/about', 'About Karimi Real Estate | Dubai Advisory Firm', 'Karimi is Dubai''s advisory-first luxury real estate firm — trusted by clients from 32 countries to guide them into the city''s most defining properties.', 'https://karimi.ae/about', 'about karimi real estate, dubai real estate advisory', 'About Karimi Real Estate', 'A firm built on counsel, not commission.', 'karimi real estate'),
  ('contact', '/contact', 'Contact Karimi Real Estate | Dubai Property Advisory', 'Speak to a senior Karimi advisor. Offices in Business Bay, Dubai. Phone, WhatsApp, email or book a private consultation.', 'https://karimi.ae/contact', 'contact dubai real estate advisor, karimi contact', 'Contact Karimi Real Estate', 'Private consultations with senior advisors in Business Bay, Dubai.', 'contact dubai real estate'),
  ('privacy', '/privacy', 'Privacy Policy | Karimi Real Estate', 'How Karimi Real Estate collects, uses and protects your personal data.', 'https://karimi.ae/privacy', '', 'Privacy Policy', 'Privacy policy for Karimi Real Estate LLC.', ''),
  ('terms', '/terms', 'Terms of Service | Karimi Real Estate', 'Terms governing use of the Karimi Real Estate website and advisory services.', 'https://karimi.ae/terms', '', 'Terms of Service', 'Terms of service for Karimi Real Estate LLC.', ''),
  ('notfound', '*', 'Page Not Found | Karimi Real Estate', 'The page you were looking for does not exist.', 'https://karimi.ae/', '', 'Page Not Found', '', '')
ON CONFLICT (page_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL DEFAULT '',
  desktop_url text NOT NULL DEFAULT '',
  mobile_url text NOT NULL DEFAULT '',
  alt text NOT NULL DEFAULT '',
  width integer NOT NULL DEFAULT 0,
  height integer NOT NULL DEFAULT 0,
  size_bytes integer NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT 'image/jpeg',
  tags text NOT NULL DEFAULT '',
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='media_library' AND policyname='Public read media') THEN
    CREATE POLICY "Public read media" ON media_library FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='media_library' AND policyname='Auth insert media') THEN
    CREATE POLICY "Auth insert media" ON media_library FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='media_library' AND policyname='Auth update media') THEN
    CREATE POLICY "Auth update media" ON media_library FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='media_library' AND policyname='Auth delete media') THEN
    CREATE POLICY "Auth delete media" ON media_library FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  section_key text NOT NULL,
  visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(page_key, section_key)
);

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_sections' AND policyname='Public read page sections') THEN
    CREATE POLICY "Public read page sections" ON page_sections FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_sections' AND policyname='Auth insert page sections') THEN
    CREATE POLICY "Auth insert page sections" ON page_sections FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_sections' AND policyname='Auth update page sections') THEN
    CREATE POLICY "Auth update page sections" ON page_sections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_sections' AND policyname='Auth delete page sections') THEN
    CREATE POLICY "Auth delete page sections" ON page_sections FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS page_sections_page_idx ON page_sections(page_key, display_order);
