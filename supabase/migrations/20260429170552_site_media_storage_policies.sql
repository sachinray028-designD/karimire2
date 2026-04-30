/*
  # Storage Policies for site-media bucket

  1. Public can read objects in the `site-media` bucket.
  2. Authenticated users can upload, update and delete objects in `site-media`.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read site-media') THEN
    CREATE POLICY "Public read site-media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'site-media');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Auth upload site-media') THEN
    CREATE POLICY "Auth upload site-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-media');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Auth update site-media') THEN
    CREATE POLICY "Auth update site-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-media') WITH CHECK (bucket_id = 'site-media');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Auth delete site-media') THEN
    CREATE POLICY "Auth delete site-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-media');
  END IF;
END $$;
