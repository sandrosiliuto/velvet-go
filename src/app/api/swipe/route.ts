import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const { swiperId, swipedId, liked } = (await req.json()) as {
      swiperId: string
      swipedId: string
      liked: boolean
    }

    if (!swiperId || !swipedId) {
      return NextResponse.json({ error: 'swiperId and swipedId required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Registrar el swipe
    await supabase
      .from('swipes')
      .upsert(
        { swiper_id: swiperId, swiped_id: swipedId, liked },
        { onConflict: 'swiper_id,swiped_id' },
      )

    // Comprobar match mutuo solo si fue un like
    if (liked) {
      const { data: mutual } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiper_id', swipedId)
        .eq('swiped_id', swiperId)
        .eq('liked', true)
        .maybeSingle()

      if (mutual) {
        const { data: matchedUser } = await supabase
          .from('velvet_users')
          .select('id, name, photo_url, phone')
          .eq('id', swipedId)
          .single()

        return NextResponse.json({ matched: true, matchedUser })
      }
    }

    return NextResponse.json({ matched: false })
  } catch (err) {
    console.error('Swipe error:', err)
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/swipe — Elimina los rechazos (liked=false) del usuario
 * para que esos perfiles vuelvan a aparecer.
 * Mantiene intactos los likes (liked=true).
 */
export async function DELETE(req: Request) {
  try {
    const { swiperId } = (await req.json()) as { swiperId: string }

    if (!swiperId) {
      return NextResponse.json({ error: 'swiperId required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Eliminar SOLO los swipes con liked=false (rechazados)
    const { error } = await supabase
      .from('swipes')
      .delete()
      .eq('swiper_id', swiperId)
      .eq('liked', false)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Rechazados reiniciados' })
  } catch (err) {
    console.error('Reset rejected error:', err)
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
