import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.ADMIN_PASSWORD}`;
  if (!authHeader || authHeader !== expected) {
    return false;
  }
  return true;
}

export async function DELETE(request: NextRequest) {
  if (!checkAdmin(request)) return unauthorized();

  const supabase = await createSupabaseServerClient();

  const { error: checkpointVisitsError } = await supabase
    .from("checkpoint_visits")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (checkpointVisitsError)
    console.error("Error borrando checkpoint_visits:", checkpointVisitsError);

  const { error: userRewardsError } = await supabase
    .from("user_rewards")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (userRewardsError)
    console.error("Error borrando user_rewards:", userRewardsError);

  const { error: checkpointsError } = await supabase
    .from("checkpoints")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (checkpointsError)
    console.error("Error borrando checkpoints:", checkpointsError);

  const { error: rewardsError } = await supabase
    .from("rewards")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (rewardsError) console.error("Error borrando rewards:", rewardsError);

  // Borrar en orden por dependencias
  const { error: matchesError } = await supabase
    .from("matches")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (matchesError) console.error("Error borrando matches:", matchesError);

  const { error: swipesError } = await supabase
    .from("swipes")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (swipesError) console.error("Error borrando swipes:", swipesError);

  const { error: usersError } = await supabase
    .from("velvet_users")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (usersError) {
    console.error("Error borrando usuarios:", usersError);
    return NextResponse.json(
      { error: "Error borrando datos" },
      { status: 500 }
    );
  }

  // Opcional: limpiar fotos del bucket
  const { data: files } = await supabase.storage.from("velvet-photos").list();
  if (files && files.length > 0) {
    const paths = files.map((f) => f.name);
    const { error: storageError } = await supabase.storage
      .from("velvet-photos")
      .remove(paths);
    if (storageError) console.error("Error borrando fotos:", storageError);
  }

  return NextResponse.json({ success: true });
}
