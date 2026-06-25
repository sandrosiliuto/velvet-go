import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { randomUUID } from "crypto";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const accepted = formData.get("accepted")?.toString();
    const photo = formData.get("photo") as File | null;

    if (!name || name.length < 2 || name.length > 60) {
      return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
    }

    const phoneRegex = /^\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Teléfono español inválido (9 dígitos)" },
        { status: 400 }
      );
    }

    if (accepted !== "true") {
      return NextResponse.json(
        { error: "Debes aceptar las condiciones" },
        { status: 400 }
      );
    }

    if (!photo || photo.size === 0) {
      return NextResponse.json({ error: "Foto obligatoria" }, { status: 400 });
    }

    if (photo.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La foto debe pesar menos de 10 MB" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data: existing } = await supabase
      .from("velvet_users")
      .select("id")
      .eq("phone", phone)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Este teléfono ya está registrado" },
        { status: 409 }
      );
    }

    // Comprimir foto a JPEG 800px de ancho
    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const compressed = await sharp(buffer)
      .rotate()
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    const fileName = `${randomUUID()}.jpg`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("velvet-photos")
      .upload(filePath, compressed, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error subiendo foto:", uploadError);
      return NextResponse.json(
        { error: "Error subiendo la foto" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("velvet-photos").getPublicUrl(filePath);

    const { data: user, error: insertError } = await supabase
      .from("velvet_users")
      .insert({
        name,
        phone,
        photo_url: publicUrl,
      })
      .select("id, name, phone, photo_url")
      .single();

    if (insertError || !user) {
      console.error("Error insertando usuario:", insertError);
      return NextResponse.json(
        { error: "Error registrando usuario" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ success: true, user }, { status: 201 });
    response.cookies.set("velvet_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    response.cookies.set("velvet_user_name", encodeURIComponent(user.name), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en /api/register:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
