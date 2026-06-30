-- =====================================================================
-- VELVET contactos — Schema (velvet_users + swipes)
-- Ejecutar en Supabase > SQL Editor
-- =====================================================================

-- 1. VELVET_USERS: perfil mínimo de cada asistente
CREATE TABLE IF NOT EXISTS public.velvet_users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  phone      text NOT NULL,  -- PRIVADO: solo se revela en match
  photo_url  text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. SWIPES: likes y passes entre asistentes
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

