import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { haversineDistance } from "@/lib/geo";

export async function POST(request: NextRequest) {
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

    const body = await request.json().catch(() => ({}));
    const { checkpointId, lat, lng } = body;

    if (!checkpointId || lat == null || lng == null) {
      return NextResponse.json(
        { error: "checkpointId, lat y lng son obligatorios" },
        { status: 400 }
      );
    }

    const userLat = Number(lat);
    const userLng = Number(lng);

    if (Number.isNaN(userLat) || Number.isNaN(userLng)) {
      return NextResponse.json(
        { error: "lat y lng deben ser números válidos" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const now = new Date();

    const { data: checkpoint, error: cpError } = await supabase
      .from("checkpoints")
      .select(
        `
        *,
        reward:reward_id (*)
      `
      )
      .eq("id", checkpointId)
      .single();

    if (cpError || !checkpoint) {
      return NextResponse.json(
        { error: "Checkpoint no encontrado" },
        { status: 404 }
      );
    }

    const reward = (checkpoint.reward ?? null) as
      | {
          id: string;
          title: string;
          code: string;
          is_active: boolean;
          starts_at?: string | null;
          expires_at?: string | null;
          quantity_total?: number | null;
          quantity_claimed?: number;
        }
      | null;

    if (!reward) {
      return NextResponse.json(
        { error: "Este checkpoint no tiene recompensa asignada" },
        { status: 400 }
      );
    }

    if (reward.is_active === false) {
      return NextResponse.json(
        { error: "Recompensa inactiva" },
        { status: 400 }
      );
    }

    if (reward.starts_at && new Date(reward.starts_at) > now) {
      return NextResponse.json(
        { error: "La recompensa aún no está disponible" },
        { status: 400 }
      );
    }

    if (reward.expires_at && new Date(reward.expires_at) < now) {
      return NextResponse.json(
        { error: "La recompensa ha caducado" },
        { status: 400 }
      );
    }

    if (
      reward.quantity_total != null &&
      (reward.quantity_claimed ?? 0) >= reward.quantity_total
    ) {
      return NextResponse.json(
        { error: "Recompensa agotada" },
        { status: 400 }
      );
    }

    const distance = haversineDistance(
      userLat,
      userLng,
      Number(checkpoint.lat),
      Number(checkpoint.lng)
    );

    if (distance > checkpoint.radius_meters) {
      return NextResponse.json(
        {
          error: "Estás demasiado lejos del checkpoint",
          distance,
          radius: checkpoint.radius_meters,
        },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from("user_rewards")
      .select("id, status")
      .eq("user_id", userId)
      .eq("reward_id", reward.id)
      .maybeSingle();

    if (existingError) {
      console.error("Error buscando user_reward:", existingError);
      return NextResponse.json(
        { error: "Error verificando recompensa" },
        { status: 500 }
      );
    }

    let userReward;

    if (existing) {
      if (existing.status !== "unlocked") {
        return NextResponse.json(
          { error: "Ya has reclamado esta recompensa", userReward: existing },
          { status: 409 }
        );
      }

      const { data: updated, error: updateError } = await supabase
        .from("user_rewards")
        .update({
          status: "unlocked",
          claimed_at: now.toISOString(),
          claimed_lat: userLat,
          claimed_lng: userLng,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError || !updated) {
        console.error("Error actualizando user_reward:", updateError);
        return NextResponse.json(
          { error: "Error reclamando recompensa" },
          { status: 500 }
        );
      }

      userReward = updated;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("user_rewards")
        .insert({
          user_id: userId,
          reward_id: reward.id,
          status: "unlocked",
          unlocked_at: now.toISOString(),
          claimed_at: now.toISOString(),
          claimed_lat: userLat,
          claimed_lng: userLng,
        })
        .select()
        .single();

      if (insertError || !inserted) {
        console.error("Error creando user_reward:", insertError);
        return NextResponse.json(
          { error: "Error reclamando recompensa" },
          { status: 500 }
        );
      }

      userReward = inserted;
    }

    await supabase.rpc("increment_reward_claimed", { reward_id: reward.id });

    await supabase.from("checkpoint_visits").insert({
      user_id: userId,
      checkpoint_id: checkpoint.id,
      distance_meters: distance,
      visited_at: now.toISOString(),
    });

    return NextResponse.json({
      success: true,
      userReward,
      reward: {
        id: reward.id,
        title: reward.title,
        code: reward.code,
      },
    });
  } catch (error) {
    console.error("Error en /api/rewards/claim:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
