import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type MatchRow = {
  id: string;
  created_at: string;
  user_a: { id: string; name: string; phone: string; photo_url: string };
  user_b: { id: string; name: string; phone: string; photo_url: string };
};

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("velvet_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    const { data: matches, error } = await supabase
      .from("matches")
      .select(`
        id,
        created_at,
        user_a: user_a_id ( id, name, phone, photo_url ),
        user_b: user_b_id ( id, name, phone, photo_url )
      `)
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .returns<MatchRow[]>();

    if (error) {
      console.error("Error obteniendo matches:", error);
      return NextResponse.json(
        { error: "Error obteniendo matches" },
        { status: 500 }
      );
    }

    const normalized = (matches ?? []).map((m) => {
      const other = m.user_a.id === userId ? m.user_b : m.user_a;
      return {
        id: m.id,
        created_at: m.created_at,
        other,
      };
    });

    return NextResponse.json({ matches: normalized });
  } catch (error) {
    console.error("Error en /api/matches:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
