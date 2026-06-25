-- ============================================================
-- VELVET GO — Rewards module: tablas de recompensas y checkpoints
-- Usa columnas numéricas lat/lng en lugar de GEOGRAPHY(POINT).
-- Ejecutar en: SQL Editor → New query → Run
-- ============================================================

-- 1. Tabla de recompensas / rewards
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'discount' CHECK (type IN ('discount', 'gift', 'experience', 'vip_access')),
  code TEXT UNIQUE,
  partner_name TEXT,
  partner_logo_url TEXT,
  location TEXT,
  unlock_radius_meters INTEGER NOT NULL DEFAULT 100,
  quantity_total INTEGER,
  quantity_claimed INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de checkpoints (lugares que desbloquean rewards)
CREATE TABLE IF NOT EXISTS public.checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'location' CHECK (type IN ('location', 'qr', 'challenge')),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 50,
  reward_id UUID REFERENCES public.rewards(id) ON DELETE SET NULL,
  challenge TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de recompensas desbloqueadas/reclamadas por usuario
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.velvet_users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unlocked' CHECK (status IN ('unlocked', 'claimed', 'redeemed', 'expired')),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  claimed_at TIMESTAMPTZ,
  claimed_lat DOUBLE PRECISION,
  claimed_lng DOUBLE PRECISION,
  UNIQUE(user_id, reward_id)
);

-- 4. Tabla de visitas a checkpoints
CREATE TABLE IF NOT EXISTS public.checkpoint_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.velvet_users(id) ON DELETE CASCADE,
  checkpoint_id UUID NOT NULL REFERENCES public.checkpoints(id) ON DELETE CASCADE,
  distance_meters DOUBLE PRECISION,
  visited_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, checkpoint_id)
);

-- Índices de lookups frecuentes
CREATE INDEX IF NOT EXISTS idx_checkpoints_lat_lng ON public.checkpoints(lat, lng);
CREATE INDEX IF NOT EXISTS idx_rewards_active_dates ON public.rewards(is_active, starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_reward ON public.user_rewards(reward_id);
CREATE INDEX IF NOT EXISTS idx_checkpoint_visits_user ON public.checkpoint_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_checkpoint_visits_checkpoint ON public.checkpoint_visits(checkpoint_id);

-- Trigger updated_at para rewards
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rewards_updated_at ON public.rewards;
CREATE TRIGGER rewards_updated_at
BEFORE UPDATE ON public.rewards
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Políticas RLS permisivas para MVP (allow_all)
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkpoint_visits ENABLE ROW LEVEL SECURITY;

-- rewards
DROP POLICY IF EXISTS "Allow all rewards" ON public.rewards;
CREATE POLICY "Allow all rewards"
  ON public.rewards FOR ALL
  USING (true)
  WITH CHECK (true);

-- checkpoints
DROP POLICY IF EXISTS "Allow all checkpoints" ON public.checkpoints;
CREATE POLICY "Allow all checkpoints"
  ON public.checkpoints FOR ALL
  USING (true)
  WITH CHECK (true);

-- user_rewards
DROP POLICY IF EXISTS "Allow all user_rewards" ON public.user_rewards;
CREATE POLICY "Allow all user_rewards"
  ON public.user_rewards FOR ALL
  USING (true)
  WITH CHECK (true);

-- checkpoint_visits
DROP POLICY IF EXISTS "Allow all checkpoint_visits" ON public.checkpoint_visits;
CREATE POLICY "Allow all checkpoint_visits"
  ON public.checkpoint_visits FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Bucket de imágenes rewards (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('velvet-rewards', 'velvet-rewards', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 7. Función helper para incrementar contador de claims
CREATE OR REPLACE FUNCTION public.increment_reward_claimed(reward_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.rewards
  SET quantity_claimed = quantity_claimed + 1
  WHERE id = reward_id;
END;
$$ LANGUAGE plpgsql;

DROP POLICY IF EXISTS "Public read velvet-rewards" ON storage.objects;
CREATE POLICY "Public read velvet-rewards"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'velvet-rewards');

DROP POLICY IF EXISTS "Public upload velvet-rewards" ON storage.objects;
CREATE POLICY "Public upload velvet-rewards"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'velvet-rewards');

DROP POLICY IF EXISTS "Public delete velvet-rewards" ON storage.objects;
CREATE POLICY "Public delete velvet-rewards"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'velvet-rewards');
