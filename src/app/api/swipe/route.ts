import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("velvet_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { swipedId, direction } = body as {
      swipedId?: string;
      direction?: "like" | "pass";
    };

    if (!swipedId || !["like", "pass"].includes(direction || "")) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    if (swipedId === userId) {
      return NextResponse.json(
        { error: "No puedes hacer swipe sobre ti mismo" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Guardar swipe
    const { error: swipeError } = await supabase.from("swipes").upsert(
      {
        swiper_id: userId,
        swiped_id: swipedId,
        direction,
      },
      { onConflict: "swiper_id, swiped_id" }
    );

    if (swipeError) {
      console.error("Error guardando swipe:", swipeError);
      return NextResponse.json(
        { error: "Error guardando swipe" },
        { status: 500 }
      );
    }

    let match = false;
    let matchRecord = null;

    if (direction === "like") {
      // Detectar match mutuo
      const { data: mutual, error: mutualError } = await supabase
        .from("swipes")
        .select("id")
        .eq("swiper_id", swipedId)
        .eq("swiped_id", userId)
        .eq("direction", "like")
        .single();

      if (mutualError && mutualError.code !== "PGRST116") {
        console.error("Error detectando match:", mutualError);
      }

      if (mutual) {
        match = true;
        const { data: insertedMatch, error: matchError } = await supabase
          .from("matches")
          .insert({
            user_a_id: userId,
            user_b_id: swipedId,
          })
          .select("*")
          .single();

        if (matchError) {
          console.error("Error creando match:", matchError);
        } else {
          matchRecord = insertedMatch;
        }
      }
    }

    return NextResponse.json({ success: true, matched: match, match: matchRecord ?? null });
  } catch (error) {
    console.error("Error en /api/swipe:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
