import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { haversineDistance } from "@/lib/geo";

const DEFAULT_RADIUS_METERS = 5000;

type RewardRow = {
  id: string;
  title: string;
  description?: string | null;
  code?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  expires_at?: string | null;
};

type CheckpointRow = {
  id: string;
  name: string;
  type: "location" | "qr" | "challenge";
  lat: number;
  lng: number;
  radius_meters: number;
  reward_id: string | null;
  challenge: string | null;
  is_active: boolean;
  reward: RewardRow | null;
};

export async function GET(request: NextRequest) {
  try {
    let userId =
      request.cookies.get("velvet_user_id_v2")?.value ||
      request.cookies.get("velvet_user_id")?.value;
    if (!userId) {
      userId = request.headers.get("x-user-id") ?? undefined;
    }
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
        reward:reward_id (
          id,
          title,
          description,
          code,
          image_url,
          is_active,
          expires_at
        )
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

        if (
          reward &&
          (reward.is_active === false ||
            (reward.expires_at && reward.expires_at < now))
        ) {
          return null;
        }

        if (distance > radius) return null;

        return {
          id: row.id,
          name: row.name,
          type: row.type,
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
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.distance_meters - b.distance_meters);

    return NextResponse.json({ checkpoints });
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
