-- =====================================================================
-- STORAGE — bucket "velvet-photos" (crear manualmente con Public: ON)
-- =====================================================================

-- 1. Crea el bucket en Supabase > Storage > New bucket
--    Nombre: velvet-photos
--    Public bucket: ON

-- 2. Lectura pública
DROP POLICY IF EXISTS "public read velvet-photos" ON storage.objects;
CREATE POLICY "public read velvet-photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'velvet-photos');

-- Cualquiera puede subir (la validación se hace en la API route)
DROP POLICY IF EXISTS "upload velvet-photos" ON storage.objects;
CREATE POLICY "upload velvet-photos"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'velvet-photos');

-- Borrar (para el admin)
DROP POLICY IF EXISTS "delete velvet-photos" ON storage.objects;
CREATE POLICY "delete velvet-photos"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'velvet-photos');

