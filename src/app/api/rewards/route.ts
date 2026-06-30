import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

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

    const supabase = await createSupabaseServerClient();

    const { data: userRewards, error } = await supabase
      .from("user_rewards")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "unlocked")
      .order("unlocked_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo recompensas del usuario:", JSON.stringify(error));
      return NextResponse.json(
        { error: "Error obteniendo recompensas", details: error },
        { status: 500 }
      );
    }

    const rewardIds = (userRewards ?? [])
      .map((ur) => ur.reward_id)
      .filter(Boolean);

    let rewardsDetails: Record<string, unknown> = {};
    if (rewardIds.length > 0) {
      const { data: rewardsData, error: rewardsError } = await supabase
        .from("rewards")
        .select("*")
        .in("id", rewardIds);
      if (rewardsError) {
        console.error("Error obteniendo detalles de rewards:", rewardsError);
      } else {
        rewardsDetails = Object.fromEntries(
          (rewardsData ?? []).map((r) => [r.id, r])
        );
      }
    }

    const data = (userRewards ?? []).map((ur) => ({
      ...ur,
      reward: rewardsDetails[ur.reward_id] ?? null,
    }));

    return NextResponse.json({ rewards: data });
  } catch (error) {
    console.error("Error en /api/rewards:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
