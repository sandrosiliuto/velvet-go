import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { haversineDistance } from "@/lib/geo";

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("velvet_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { rewardId, checkpointId, lat, lng } = body;

    if (!rewardId || lat == null || lng == null) {
      return NextResponse.json(
        { error: "rewardId, lat y lng son obligatorios" },
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

    // Verificar que la reward existe, está activa y no caducada
    const { data: reward, error: rewardError } = await supabase
      .from("rewards")
      .select("*")
      .eq("id", rewardId)
      .eq("is_active", true)
      .single();

    if (rewardError || !reward) {
      return NextResponse.json(
        { error: "Recompensa no encontrada" },
        { status: 404 }
      );
    }

    const now = new Date();
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

    // Si tiene stock total y ya se agotó
    if (
      reward.quantity_total != null &&
      reward.quantity_claimed >= reward.quantity_total
    ) {
      return NextResponse.json(
        { error: "Recompensa agotada" },
        { status: 400 }
      );
    }

    // Si la reward está vinculada a un checkpoint, comprobar proximidad
    if (checkpointId) {
      const { data: checkpoint, error: cpError } = await supabase
        .from("checkpoints")
        .select("*")
        .eq("id", checkpointId)
        .single();

      if (cpError || !checkpoint) {
        return NextResponse.json(
          { error: "Checkpoint no encontrado" },
          { status: 404 }
        );
      }

      if (
        checkpoint.lat == null ||
        checkpoint.lng == null ||
        Number.isNaN(Number(checkpoint.lat)) ||
        Number.isNaN(Number(checkpoint.lng))
      ) {
        return NextResponse.json(
          { error: "Checkpoint sin coordenadas válidas" },
          { status: 500 }
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

      // Registrar visita al checkpoint
      await supabase.from("checkpoint_visits").upsert(
        {
          user_id: userId,
          checkpoint_id: checkpoint.id,
          distance_meters: distance,
          visited_at: now.toISOString(),
        },
        { onConflict: "user_id,checkpoint_id" }
      );
    }

    // Verificar / crear user_reward
    const { data: existing, error: existingError } = await supabase
      .from("user_rewards")
      .select("*")
      .eq("user_id", userId)
      .eq("reward_id", rewardId)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      console.error("Error buscando user_reward:", existingError);
    }

    const locationPayload = {
      claimed_lat: userLat,
      claimed_lng: userLng,
    };

    if (existing) {
      if (existing.status === "claimed" || existing.status === "redeemed") {
        return NextResponse.json(
          { error: "Ya has reclamado esta recompensa", userReward: existing },
          { status: 409 }
        );
      }
      // unlocked -> claimed
      const { data: updated, error: updateError } = await supabase
        .from("user_rewards")
        .update({
          status: "claimed",
          claimed_at: now.toISOString(),
          ...locationPayload,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error actualizando user_reward:", updateError);
        return NextResponse.json(
          { error: "Error reclamando recompensa" },
          { status: 500 }
        );
      }

      await incrementClaimed(supabase, rewardId);
      return NextResponse.json({ success: true, userReward: updated });
    }

    // Crear directamente como claimed
    const { data: created, error: insertError } = await supabase
      .from("user_rewards")
      .insert({
        user_id: userId,
        reward_id: rewardId,
        status: "claimed",
        unlocked_at: now.toISOString(),
        claimed_at: now.toISOString(),
        ...locationPayload,
      })
      .select()
      .single();

    if (insertError || !created) {
      console.error("Error creando user_reward:", insertError);
      return NextResponse.json(
        { error: "Error reclamando recompensa" },
        { status: 500 }
      );
    }

    await incrementClaimed(supabase, rewardId);
    return NextResponse.json({ success: true, userReward: created });
  } catch (error) {
    console.error("Error en /api/rewards/claim:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

async function incrementClaimed(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  rewardId: string
) {
  await supabase.rpc("increment_reward_claimed", { reward_id: rewardId });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
