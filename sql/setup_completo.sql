-- =====================================================================
-- VELVET contactos — Setup completo (NO ejecutar aún)
-- =====================================================================

-- 1. TABLAS
CREATE TABLE IF NOT EXISTS public.velvet_users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  phone      text NOT NULL,
  photo_url  text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.swipes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id  uuid NOT NULL REFERENCES public.velvet_users(id) ON DELETE CASCADE,
  swiped_id  uuid NOT NULL REFERENCES public.velvet_users(id) ON DELETE CASCADE,
  liked      boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)
);

CREATE INDEX IF NOT EXISTS swipes_swiper_idx ON public.swipes(swiper_id);
CREATE INDEX IF NOT EXISTS swipes_swiped_idx ON public.swipes(swiped_id);

-- 2. RLS
ALTER TABLE public.velvet_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes      ENABLE ROW LEVEL SECURITY;

-- Vista pública: oculta el teléfono en selects anónimos
DROP VIEW IF EXISTS public.velvet_users_public;
CREATE VIEW public.velvet_users_public AS
  SELECT id, name, photo_url, created_at
  FROM public.velvet_users;

DROP POLICY IF EXISTS "velvet_users_public_select" ON public.velvet_users;
CREATE POLICY "velvet_users_public_select"
  ON public.velvet_users FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "velvet_users_insert" ON public.velvet_users;
CREATE POLICY "velvet_users_insert"
  ON public.velvet_users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "velvet_users_delete" ON public.velvet_users;
CREATE POLICY "velvet_users_delete"
  ON public.velvet_users FOR DELETE
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "swipes_insert" ON public.swipes;
CREATE POLICY "swipes_insert"
  ON public.swipes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "swipes_select" ON public.swipes;
CREATE POLICY "swipes_select"
  ON public.swipes FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "swipes_delete" ON public.swipes;
CREATE POLICY "swipes_delete"
  ON public.swipes FOR DELETE
  TO anon, authenticated
  USING (true);

-- 3. STORAGE
-- Crea el bucket "velvet-photos" manualmente en Supabase > Storage
-- y marca "Public bucket" = ON antes de ejecutar estas políticas.

DROP POLICY IF EXISTS "public read velvet-photos" ON storage.objects;
CREATE POLICY "public read velvet-photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'velvet-photos');

DROP POLICY IF EXISTS "upload velvet-photos" ON storage.objects;
CREATE POLICY "upload velvet-photos"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'velvet-photos');

DROP POLICY IF EXISTS "delete velvet-photos" ON storage.objects;
CREATE POLICY "delete velvet-photos"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'velvet-photos');

