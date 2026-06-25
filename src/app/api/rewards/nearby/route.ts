import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const DEFAULT_RADIUS_METERS = 5000;

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

    // Checkpoints cercanos con su reward asociada
    const { data: checkpoints, error: cpError } = await supabase.rpc(
      "nearby_checkpoints",
      {
        user_lat: lat,
        user_lng: lng,
        search_radius: radius,
      }
    );

    if (cpError) {
      console.error("Error nearby_checkpoints:", cpError);
      return NextResponse.json(
        { error: "Error obteniendo checkpoints" },
        { status: 500 }
      );
    }

    // Rewards activas que no tengan checkpoint asignado (recompensas globales)
    const now = new Date().toISOString();
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
      checkpoints: checkpoints ?? [],
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
