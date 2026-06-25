import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.ADMIN_PASSWORD}`;
  return !!authHeader && authHeader === expected;
}

export async function GET(request: NextRequest) {
  if (!checkAdmin(request)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const rewardId = searchParams.get("rewardId");

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("checkpoints")
    .select("*, reward:reward_id(title)")
    .order("created_at", { ascending: false });

  if (rewardId) {
    query = query.eq("reward_id", rewardId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error admin checkpoints:", error);
    return NextResponse.json(
      { error: "Error obteniendo checkpoints" },
      { status: 500 }
    );
  }

  return NextResponse.json({ checkpoints: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!checkAdmin(request)) return unauthorized();

  try {
    const body = await request.json().catch(() => ({}));
    const {
      name,
      type,
      lat,
      lng,
      radius_meters,
      reward_id,
      challenge,
      is_active,
    } = body;

    if (!name || lat == null || lng == null) {
      return NextResponse.json(
        { error: "name, lat y lng son obligatorios" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("checkpoints")
      .insert({
        name,
        type: type || "location",
        lat,
        lng,
        radius_meters: radius_meters ?? 50,
        reward_id,
        challenge,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Error creando checkpoint:", error);
      return NextResponse.json(
        { error: "Error creando checkpoint" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, checkpoint: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/admin/checkpoints:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAdmin(request)) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "id es obligatorio" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("checkpoints").delete().eq("id", id);

    if (error) {
      console.error("Error borrando checkpoint:", error);
      return NextResponse.json(
        { error: "Error borrando checkpoint" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en DELETE /api/admin/checkpoints:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
