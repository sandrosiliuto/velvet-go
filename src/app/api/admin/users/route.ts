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

export async function GET(request: NextRequest) {
  if (!checkAdmin(request)) return unauthorized();

  const supabase = await createSupabaseServerClient();
  const { data: users, error } = await supabase
    .from("velvet_users")
    .select("id, name, phone, photo_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error admin users:", error);
    return NextResponse.json(
      { error: "Error obteniendo usuarios" },
      { status: 500 }
    );
  }

  return NextResponse.json({ users });
}
