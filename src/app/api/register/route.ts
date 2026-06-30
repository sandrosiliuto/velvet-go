import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const name = (formData.get('name') as string)?.trim()
    const phone = (formData.get('phone') as string)?.trim()
    const photo = formData.get('photo') as File | null

    if (!name || !phone) {
      return NextResponse.json({ error: 'Nombre y teléfono son obligatorios' }, { status: 400 })
    }

    // ── DEMO MODE (sin variables de entorno) ──────────────────────
    const isDemoMode =
      !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY
    if (isDemoMode) {
      const id = `demo-${crypto.randomUUID()}`
      const response = NextResponse.json({ user: { id, name, photo_url: null } })
      response.cookies.set('velvet_user_id', id, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 8,
        path: '/',
      })
      // Guardamos también el nombre para el saludo en discover
      response.cookies.set('velvet_user_name', name, {
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 8,
        path: '/',
      })
      return response
    }
    // ─────────────────────────────────────────────────────────────

    const supabase = createServiceClient()
    let photoUrl: string | null = null

    // Helper: subir foto a Supabase Storage si se proporcionó
    async function uploadPhoto(photo: File | null): Promise<string | null> {
      if (!photo || photo.size === 0) return null
      try {
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `${crypto.randomUUID()}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('velvet-photos')
          .upload(filename, buffer, { contentType: 'image/jpeg', cacheControl: '31536000' })
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('velvet-photos').getPublicUrl(filename)
          return publicUrl
        } else {
          console.warn('Photo upload warning:', uploadError.message)
        }
      } catch (e) {
        console.warn('Photo upload failed (non-blocking):', e)
      }
      return null
    }

    // ── Buscar si el teléfono ya está registrado (reautenticación) ──
    const { data: existingUser, error: fetchError } = await supabase
      .from('velvet_users')
      .select('id, name, photo_url')
      .eq('phone', phone)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json({ error: `DB: ${fetchError.message}` }, { status: 500 })
    }

    let user: { id: string; name: string; photo_url: string | null }

    if (existingUser) {
      // Reautenticación: actualizar foto si se subió una nueva
      photoUrl = await uploadPhoto(photo)
      if (photoUrl) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('velvet_users')
          .update({ photo_url: photoUrl })
          .eq('id', existingUser.id)
          .select('id, name, photo_url')
          .single()
        if (updateError) {
          return NextResponse.json({ error: `DB: ${updateError.message}` }, { status: 500 })
        }
        user = updatedUser
      } else {
        user = existingUser
      }
    } else {
      // Registro nuevo
      photoUrl = await uploadPhoto(photo)
      const { data: insertedUser, error } = await supabase
        .from('velvet_users')
        .insert({ name, phone, photo_url: photoUrl })
        .select('id, name, photo_url')
        .single()

      if (error) {
        return NextResponse.json({ error: `DB: ${error.message}` }, { status: 500 })
      }
      user = insertedUser
    }

    // Setear cookie de sesión (httpOnly) + cookie de nombre (legible desde JS)
    const response = NextResponse.json({ user })
    response.cookies.set('velvet_user_id', user.id, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    response.cookies.set('velvet_user_name', user.name, {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
