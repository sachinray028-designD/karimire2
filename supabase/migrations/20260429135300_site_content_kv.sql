/*
  # Site Content Key-Value Store

  1. New Tables
    - `site_content`
      - `key` (text, primary key) — dotted path like "home.hero.title"
      - `value` (text) — content value (text, image URL, etc.)
      - `type` (text) — "text" | "image" | "url" | "html"
      - `section` (text) — grouping label for the admin UI (e.g., "home.hero")
      - `label` (text) — human-friendly name shown in the admin
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Public read access (site content must render for anonymous visitors)
    - Authenticated users can insert/update/delete (admin panel is authenticated)
*/

CREATE TABLE IF NOT EXISTS site_content (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'text',
  section text NOT NULL DEFAULT 'general',
  label text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_content' AND policyname='Public can read site content') THEN
    CREATE POLICY "Public can read site content"
      ON site_content FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_content' AND policyname='Authenticated can insert site content') THEN
    CREATE POLICY "Authenticated can insert site content"
      ON site_content FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_content' AND policyname='Authenticated can update site content') THEN
    CREATE POLICY "Authenticated can update site content"
      ON site_content FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_content' AND policyname='Authenticated can delete site content') THEN
    CREATE POLICY "Authenticated can delete site content"
      ON site_content FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS site_content_section_idx ON site_content(section);
