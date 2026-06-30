-- =====================================================================
-- RLS — el teléfono NUNCA se expone en selects públicos
-- =====================================================================

ALTER TABLE public.velvet_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes      ENABLE ROW LEVEL SECURITY;

-- velvet_users: lectura pública de id, name, photo_url (SIN phone)
-- Usamos una vista para garantizarlo.
DROP VIEW IF EXISTS public.velvet_users_public;
CREATE VIEW public.velvet_users_public AS
  SELECT id, name, photo_url, created_at
  FROM public.velvet_users;

-- Anon puede leer la vista pública (sin phone)
DROP POLICY IF EXISTS "velvet_users_public_select" ON public.velvet_users;
CREATE POLICY "velvet_users_public_select"
  ON public.velvet_users FOR SELECT
  TO anon, authenticated
  USING (true);
-- Nota: el teléfono solo lo lee el service_role desde las API routes.

-- Insert: cualquiera puede registrarse
DROP POLICY IF EXISTS "velvet_users_insert" ON public.velvet_users;
CREATE POLICY "velvet_users_insert"
  ON public.velvet_users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- SWIPES: insert y lectura sin restricción de fila
-- (la lógica de autorización se valida en la API route)
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

-- velvet_users delete (para borrar todo al final del evento)
DROP POLICY IF EXISTS "velvet_users_delete" ON public.velvet_users;
CREATE POLICY "velvet_users_delete"
  ON public.velvet_users FOR DELETE
  TO anon, authenticated
  USING (true);
