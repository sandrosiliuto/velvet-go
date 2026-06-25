import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { haversineDistance } from "@/lib/geo";

const DEFAULT_RADIUS_METERS = 5000;

type CheckpointRow = {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  radius_meters: number;
  reward_id: string | null;
  challenge: string | null;
  is_active: boolean;
  reward: Record<string, unknown> | null;
};

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("velvet_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") ?? "NaN");
    const lng = parseFloat(searchParams.get("lng") ?? "NaN");
    const radius = parseInt(
      searchParams.get("radius") ?? String(DEFAULT_RADIUS_METERS),
      10
    );

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json(
        { error: "lat y lng son obligatorios" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();

    // Traemos checkpoints activos con su reward asociada
    const { data: rows, error: cpError } = await supabase
      .from("checkpoints")
      .select(
        `
        id,
        name,
        type,
        lat,
        lng,
        radius_meters,
        reward_id,
        challenge,
        is_active,
        reward:reward_id (*)
      `
      )
      .eq("is_active", true);

    if (cpError) {
      console.error("Error checkpoints:", cpError);
      return NextResponse.json(
        { error: "Error obteniendo checkpoints" },
        { status: 500 }
      );
    }

    const checkpoints = (rows ?? [])
      .map((cp) => {
        const row = cp as unknown as CheckpointRow;
        const reward = row.reward;
        const distance = haversineDistance(lat, lng, row.lat, row.lng);

        // Saltar checkpoints vinculados a rewards inactivas o caducadas
        if (
          reward &&
          (reward.is_active === false ||
            (reward.expires_at && (reward.expires_at as string) < now))
        ) {
          return null;
        }

        if (distance > radius) return null;

        return {
          id: row.id,
          name: row.name,
          type: row.type as "location" | "qr" | "challenge",
          lat: row.lat,
          lng: row.lng,
          radius_meters: row.radius_meters,
          reward_id: row.reward_id,
          reward: reward
            ? {
                id: reward.id,
                title: reward.title,
                description: reward.description,
                code: reward.code,
                image_url: reward.image_url,
              }
            : null,
          distance_meters: distance,
          challenge: row.challenge,
          is_active: row.is_active,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a?.distance_meters ?? 0) - (b?.distance_meters ?? 0));

    // Rewards activas que no tengan checkpoint asignado (recompensas globales)
    const { data: rewards, error: rError } = await supabase
      .from("rewards")
      .select("*")
      .eq("is_active", true)
      .or(`starts_at.lte.${now},starts_at.is.null`)
      .or(`expires_at.gte.${now},expires_at.is.null`)
      .is("location", null);

    if (rError) {
      console.error("Error rewards:", rError);
    }

    // Rewards del usuario (unlocked / claimed) para marcar en el mapa/lista
    const { data: userRewards, error: urError } = await supabase
      .from("user_rewards")
      .select("reward_id, status")
      .eq("user_id", userId);

    if (urError) {
      console.error("Error user_rewards:", urError);
    }

    const statusByReward = new Map(
      userRewards?.map((ur) => [ur.reward_id, ur.status]) ?? []
    );

    return NextResponse.json({
      checkpoints,
      rewards: rewards ?? [],
      userRewardStatus: Object.fromEntries(statusByReward),
    });
  } catch (error) {
    console.error("Error en /api/rewards/nearby:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
