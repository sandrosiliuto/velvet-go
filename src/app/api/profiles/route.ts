import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("velvet_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    const { data: profiles, error } = await supabase
      .from("velvet_users")
      .select("id, name, phone, photo_url, created_at")
      .neq("id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo perfiles:", error);
      return NextResponse.json(
        { error: "Error obteniendo perfiles" },
        { status: 500 }
      );
    }

    // Excluir perfiles con los que ya hay swipe del usuario actual
    const { data: swipes, error: swipesError } = await supabase
      .from("swipes")
      .select("swiped_id")
      .eq("swiper_id", userId);

    if (swipesError) {
      console.error("Error obteniendo swipes:", swipesError);
    }

    const swipedIds = new Set(swipes?.map((s) => s.swiped_id) ?? []);
    const filtered = profiles?.filter((p) => !swipedIds.has(p.id)) ?? [];

    return NextResponse.json({ profiles: filtered });
  } catch (error) {
    console.error("Error en /api/profiles:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
