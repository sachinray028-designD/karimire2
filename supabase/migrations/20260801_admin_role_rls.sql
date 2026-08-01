/*
  # Admin Role + RLS Hardening

  1. New Table: admin_users
     - Links to auth.users via FK
     - Used by RLS policies to restrict write operations to verified admins
     - Admins must be added manually via Supabase SQL Editor or Dashboard

  2. Policy Changes
     - All existing write policies (INSERT/UPDATE/DELETE) that use blanket
       `TO authenticated WITH CHECK (true)` are replaced with policies
       that check `auth.uid() IN (SELECT id FROM admin_users)`
     - SELECT policies remain unchanged (public read for active/published rows)
     - Storage policies for site-media bucket are also tightened

  3. How to add an admin
     After running this migration, add your admin user(s) by their auth.users UUID:

       INSERT INTO admin_users (id) VALUES ('your-user-uuid-here');

     You can find user UUIDs in: Supabase Dashboard > Authentication > Users
*/

-- ============================================================
-- 1. Create admin_users table
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admins can read the admin list (needed for frontend guard)
-- Anon can also SELECT (needed so the AdminLayout check works with the anon key before session is fully resolved)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_users' AND policyname='Admins can read admin_users') THEN
    CREATE POLICY "Admins can read admin_users"
      ON admin_users FOR SELECT TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- ============================================================
-- 2. Helper function for admin check
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
$$;

-- ============================================================
-- 3. Replace write policies — developers
-- ============================================================
DROP POLICY IF EXISTS "Auth can insert developers" ON developers;
DROP POLICY IF EXISTS "Auth can update developers" ON developers;
DROP POLICY IF EXISTS "Auth can delete developers" ON developers;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='developers' AND policyname='Admin can insert developers') THEN
    CREATE POLICY "Admin can insert developers"
      ON developers FOR INSERT TO authenticated
      WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='developers' AND policyname='Admin can update developers') THEN
    CREATE POLICY "Admin can update developers"
      ON developers FOR UPDATE TO authenticated
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='developers' AND policyname='Admin can delete developers') THEN
    CREATE POLICY "Admin can delete developers"
      ON developers FOR DELETE TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- ============================================================
-- 4. Replace write policies — properties
-- ============================================================
DROP POLICY IF EXISTS "Auth can insert properties" ON properties;
DROP POLICY IF EXISTS "Auth can update properties" ON properties;
DROP POLICY IF EXISTS "Auth can delete properties" ON properties;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='properties' AND policyname='Admin can insert properties') THEN
    CREATE POLICY "Admin can insert properties"
      ON properties FOR INSERT TO authenticated
      WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='properties' AND policyname='Admin can update properties') THEN
    CREATE POLICY "Admin can update properties"
      ON properties FOR UPDATE TO authenticated
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='properties' AND policyname='Admin can delete properties') THEN
    CREATE POLICY "Admin can delete properties"
      ON properties FOR DELETE TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- ============================================================
-- 5. Replace write policies — leads (keep anon INSERT for inquiry form)
-- ============================================================
DROP POLICY IF EXISTS "Auth can view leads" ON leads;
DROP POLICY IF EXISTS "Auth can update leads" ON leads;
DROP POLICY IF EXISTS "Auth can delete leads" ON leads;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leads' AND policyname='Admin can view leads') THEN
    CREATE POLICY "Admin can view leads"
      ON leads FOR SELECT TO authenticated
      USING (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leads' AND policyname='Admin can update leads') THEN
    CREATE POLICY "Admin can update leads"
      ON leads FOR UPDATE TO authenticated
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leads' AND policyname='Admin can delete leads') THEN
    CREATE POLICY "Admin can delete leads"
      ON leads FOR DELETE TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- ============================================================
-- 6. Replace write policies — testimonials
-- ============================================================
DROP POLICY IF EXISTS "Auth can insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Auth can update testimonials" ON testimonials;
DROP POLICY IF EXISTS "Auth can delete testimonials" ON testimonials;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='Admin can insert testimonials') THEN
    CREATE POLICY "Admin can insert testimonials"
      ON testimonials FOR INSERT TO authenticated
      WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='Admin can update testimonials') THEN
    CREATE POLICY "Admin can update testimonials"
      ON testimonials FOR UPDATE TO authenticated
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='testimonials' AND policyname='Admin can delete testimonials') THEN
    CREATE POLICY "Admin can delete testimonials"
      ON testimonials FOR DELETE TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- ============================================================
-- 7. Replace write policies — blog_posts
-- ============================================================
DROP POLICY IF EXISTS "Auth can insert posts" ON blog_posts;
DROP POLICY IF EXISTS "Auth can update posts" ON blog_posts;
DROP POLICY IF EXISTS "Auth can delete posts" ON blog_posts;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_posts' AND policyname='Admin can insert posts') THEN
    CREATE POLICY "Admin can insert posts"
      ON blog_posts FOR INSERT TO authenticated
      WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_posts' AND policyname='Admin can update posts') THEN
    CREATE POLICY "Admin can update posts"
      ON blog_posts FOR UPDATE TO authenticated
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_posts' AND policyname='Admin can delete posts') THEN
    CREATE POLICY "Admin can delete posts"
      ON blog_posts FOR DELETE TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- ============================================================
-- 8. Replace write policies — site_content
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can insert site content" ON site_content;
DROP POLICY IF EXISTS "Authenticated can update site content" ON site_content;
DROP POLICY IF EXISTS "Authenticated can delete site content" ON site_content;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_content' AND policyname='Admin can insert site content') THEN
    CREATE POLICY "Admin can insert site content"
      ON site_content FOR INSERT TO authenticated
      WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_content' AND policyname='Admin can update site content') THEN
    CREATE POLICY "Admin can update site content"
      ON site_content FOR UPDATE TO authenticated
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_content' AND policyname='Admin can delete site content') THEN
    CREATE POLICY "Admin can delete site content"
      ON site_content FOR DELETE TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- ============================================================
-- 9. Replace write policies — seo_global
-- ============================================================
DROP POLICY IF EXISTS "Auth insert seo global" ON seo_global;
DROP POLICY IF EXISTS "Auth update seo global" ON seo_global;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='seo_global' AND policyname='Admin insert seo global') THEN
    CREATE POLICY "Admin insert seo global"
      ON seo_global FOR INSERT TO authenticated
      WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='seo_global' AND policyname='Admin update seo global') THEN
    CREATE POLICY "Admin update seo global"
      ON seo_global FOR UPDATE TO authenticated
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
END $$;

-- ============================================================
-- 10. Replace write policies — page_seo
-- ============================================================
DROP POLICY IF EXISTS "Auth insert page seo" ON page_seo;
DROP POLICY IF EXISTS "Auth update page seo" ON page_seo;
DROP POLICY IF EXISTS "Auth delete page seo" ON page_seo;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_seo' AND policyname='Admin insert page seo') THEN
    CREATE POLICY "Admin insert page seo"
      ON page_seo FOR INSERT TO authenticated
      WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_seo' AND policyname='Admin update page seo') THEN
    CREATE POLICY "Admin update page seo"
      ON page_seo FOR UPDATE TO authenticated
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_seo' AND policyname='Admin delete page seo') THEN
    CREATE POLICY "Admin delete page seo"
      ON page_seo FOR DELETE TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- ============================================================
-- 11. Replace write policies — media_library
-- ============================================================
DROP POLICY IF EXISTS "Auth insert media" ON media_library;
DROP POLICY IF EXISTS "Auth update media" ON media_library;
DROP POLICY IF EXISTS "Auth delete media" ON media_library;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='media_library' AND policyname='Admin insert media') THEN
    CREATE POLICY "Admin insert media"
      ON media_library FOR INSERT TO authenticated
      WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='media_library' AND policyname='Admin update media') THEN
    CREATE POLICY "Admin update media"
      ON media_library FOR UPDATE TO authenticated
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='media_library' AND policyname='Admin delete media') THEN
    CREATE POLICY "Admin delete media"
      ON media_library FOR DELETE TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- ============================================================
-- 12. Replace write policies — page_sections
-- ============================================================
DROP POLICY IF EXISTS "Auth insert page sections" ON page_sections;
DROP POLICY IF EXISTS "Auth update page sections" ON page_sections;
DROP POLICY IF EXISTS "Auth delete page sections" ON page_sections;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_sections' AND policyname='Admin insert page sections') THEN
    CREATE POLICY "Admin insert page sections"
      ON page_sections FOR INSERT TO authenticated
      WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_sections' AND policyname='Admin update page sections') THEN
    CREATE POLICY "Admin update page sections"
      ON page_sections FOR UPDATE TO authenticated
      USING (is_admin()) WITH CHECK (is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_sections' AND policyname='Admin delete page sections') THEN
    CREATE POLICY "Admin delete page sections"
      ON page_sections FOR DELETE TO authenticated
      USING (is_admin());
  END IF;
END $$;

-- ============================================================
-- 13. Replace write policies — storage.objects (site-media bucket)
-- ============================================================
DROP POLICY IF EXISTS "Auth upload site-media" ON storage.objects;
DROP POLICY IF EXISTS "Auth update site-media" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete site-media" ON storage.objects;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Admin upload site-media') THEN
    CREATE POLICY "Admin upload site-media"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'site-media' AND is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Admin update site-media') THEN
    CREATE POLICY "Admin update site-media"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'site-media' AND is_admin())
      WITH CHECK (bucket_id = 'site-media' AND is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Admin delete site-media') THEN
    CREATE POLICY "Admin delete site-media"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'site-media' AND is_admin());
  END IF;
END $$;
