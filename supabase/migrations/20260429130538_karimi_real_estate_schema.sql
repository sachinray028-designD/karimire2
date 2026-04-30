/*
  # Karimi Real Estate Schema

  1. New Tables
    - developers: partner developer profiles
    - properties: property listings with public + gated fields
    - leads: inquiry submissions tagged to properties
    - testimonials: client testimonials
    - blog_posts: market insights articles
  2. Security
    - RLS enabled on all tables
    - Public SELECT for active/published rows
    - Anonymous INSERT allowed on leads (required for inquiry form)
    - Authenticated full management (admin)
*/

CREATE TABLE IF NOT EXISTS developers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text DEFAULT '',
  description text DEFAULT '',
  established text DEFAULT '',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  project_name text NOT NULL,
  developer_id uuid REFERENCES developers(id) ON DELETE SET NULL,
  developer_name text DEFAULT '',
  location text NOT NULL,
  property_type text NOT NULL DEFAULT 'Apartment',
  configurations text[] DEFAULT '{}',
  starting_price numeric DEFAULT 0,
  currency text DEFAULT 'AED',
  down_payment_percent numeric DEFAULT 20,
  handover_date text DEFAULT '',
  status text DEFAULT 'Off-Plan',
  overview text DEFAULT '',
  hero_images text[] DEFAULT '{}',
  gallery_images text[] DEFAULT '{}',
  floor_plan_images text[] DEFAULT '{}',
  brochure_url text DEFAULT '',
  amenities text[] DEFAULT '{}',
  key_highlights text[] DEFAULT '{}',
  payment_plan jsonb DEFAULT '[]'::jsonb,
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  property_name text DEFAULT '',
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  message text DEFAULT '',
  budget text DEFAULT '',
  purpose text DEFAULT '',
  status text DEFAULT 'new',
  notes text DEFAULT '',
  source text DEFAULT 'website',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text DEFAULT '',
  avatar_url text DEFAULT '',
  quote text NOT NULL,
  rating int DEFAULT 5,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  cover_image text DEFAULT '',
  author text DEFAULT 'Karimi Advisory',
  category text DEFAULT 'Market Insights',
  read_time text DEFAULT '5 min',
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active developers" ON developers FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Auth can insert developers" ON developers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update developers" ON developers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete developers" ON developers FOR DELETE TO authenticated USING (true);

CREATE POLICY "Public can view active properties" ON properties FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Auth can insert properties" ON properties FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update properties" ON properties FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete properties" ON properties FOR DELETE TO authenticated USING (true);

CREATE POLICY "Anyone can submit a lead" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Auth can view leads" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can update leads" ON leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete leads" ON leads FOR DELETE TO authenticated USING (true);

CREATE POLICY "Public can view active testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Auth can insert testimonials" ON testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update testimonials" ON testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete testimonials" ON testimonials FOR DELETE TO authenticated USING (true);

CREATE POLICY "Public can view published posts" ON blog_posts FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Auth can insert posts" ON blog_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update posts" ON blog_posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth can delete posts" ON blog_posts FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_leads_property ON leads(property_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
