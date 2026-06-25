import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { randomUUID } from "crypto";

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

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error admin rewards:", error);
    return NextResponse.json(
      { error: "Error obteniendo rewards" },
      { status: 500 }
    );
  }

  return NextResponse.json({ rewards: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!checkAdmin(request)) return unauthorized();

  try {
    const body = await request.json().catch(() => ({}));
    const {
      title,
      description,
      type,
      code,
      partner_name,
      partner_logo_url,
      location,
      unlock_radius_meters,
      quantity_total,
      starts_at,
      expires_at,
      image_url,
      is_active,
    } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: "title y type son obligatorios" },
        { status: 400 }
      );
    }

    const finalCode = code || randomUUID().slice(0, 8).toUpperCase();

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("rewards")
      .insert({
        title,
        description,
        type,
        code: finalCode,
        partner_name,
        partner_logo_url,
        location,
        unlock_radius_meters,
        quantity_total,
        starts_at,
        expires_at,
        image_url,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Error creando reward:", error);
      return NextResponse.json(
        { error: "Error creando reward" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reward: data }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/admin/rewards:", error);
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
    const { error } = await supabase.from("rewards").delete().eq("id", id);

    if (error) {
      console.error("Error borrando reward:", error);
      return NextResponse.json(
        { error: "Error borrando reward" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en DELETE /api/admin/rewards:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
