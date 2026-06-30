import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("velvet_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("user_rewards")
      .select(
        `
        *,
        reward:reward_id (*)
      `
      )
      .eq("user_id", userId)
      .eq("status", "unlocked")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo recompensas del usuario:", error);
      return NextResponse.json(
        { error: "Error obteniendo recompensas" },
        { status: 500 }
      );
    }

    return NextResponse.json({ rewards: data ?? [] });
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
