-- ============================================================
-- VELVET contactos — setup completo de base de datos Supabase
-- Ejecutar en: SQL Editor → New query → Run
-- ============================================================

-- 1. Tabla de usuarios
CREATE TABLE IF NOT EXISTS public.velvet_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de swipes (like/pass)
CREATE TABLE IF NOT EXISTS public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL REFERENCES public.velvet_users(id) ON DELETE CASCADE,
  swiped_id UUID NOT NULL REFERENCES public.velvet_users(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('like', 'pass')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)
);

-- 3. Tabla de matches
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL REFERENCES public.velvet_users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES public.velvet_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_a_id, user_b_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON public.swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped ON public.swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_a ON public.matches(user_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON public.matches(user_b_id);

-- 4. Función para normalizar orden de parejas de match
CREATE OR REPLACE FUNCTION public.ensure_match_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_a_id > NEW.user_b_id THEN
    DECLARE
      tmp UUID;
    BEGIN
      tmp := NEW.user_a_id;
      NEW.user_a_id := NEW.user_b_id;
      NEW.user_b_id := tmp;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_match_order ON public.matches;
CREATE TRIGGER trigger_match_order
BEFORE INSERT ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.ensure_match_order();

-- 5. Políticas RLS permisivas para MVP
ALTER TABLE public.velvet_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- velvet_users: lectura pública, inserción pública
DROP POLICY IF EXISTS "Allow public read users" ON public.velvet_users;
CREATE POLICY "Allow public read users"
  ON public.velvet_users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert users" ON public.velvet_users;
CREATE POLICY "Allow public insert users"
  ON public.velvet_users FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow own update users" ON public.velvet_users;
CREATE POLICY "Allow own update users"
  ON public.velvet_users FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow own delete users" ON public.velvet_users;
CREATE POLICY "Allow own delete users"
  ON public.velvet_users FOR DELETE
  USING (true);

-- swipes: lectura/escritura pública
DROP POLICY IF EXISTS "Allow public read swipes" ON public.swipes;
CREATE POLICY "Allow public read swipes"
  ON public.swipes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert swipes" ON public.swipes;
CREATE POLICY "Allow public insert swipes"
  ON public.swipes FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete swipes" ON public.swipes;
CREATE POLICY "Allow public delete swipes"
  ON public.swipes FOR DELETE
  USING (true);

-- matches: lectura pública
DROP POLICY IF EXISTS "Allow public read matches" ON public.matches;
CREATE POLICY "Allow public read matches"
  ON public.matches FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert matches" ON public.matches;
CREATE POLICY "Allow public insert matches"
  ON public.matches FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete matches" ON public.matches;
CREATE POLICY "Allow public delete matches"
  ON public.matches FOR DELETE
  USING (true);

-- 6. Bucket de fotos (el bucket debe crearse desde Storage UI o API, ver script de setup)
-- La política pública de lectura se configura vía SQL si se usa la extensión storage:

-- Asegurar que el bucket sea público (ejecutar si existe)
UPDATE storage.buckets
SET public = true
WHERE id = 'velvet-photos';

-- Políticas de lectura pública para el bucket velvet-photos
DROP POLICY IF EXISTS "Public read velvet-photos" ON storage.objects;
CREATE POLICY "Public read velvet-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'velvet-photos');

DROP POLICY IF EXISTS "Public upload velvet-photos" ON storage.objects;
CREATE POLICY "Public upload velvet-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'velvet-photos');

DROP POLICY IF EXISTS "Public delete velvet-photos" ON storage.objects;
CREATE POLICY "Public delete velvet-photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'velvet-photos');
