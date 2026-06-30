import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

function checkPassword(req: NextRequest) {
  const pw = req.nextUrl.searchParams.get('pw')
  return pw === process.env.ADMIN_PASSWORD
}

export async function DELETE(req: NextRequest) {
  if (!checkPassword(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Borrar en orden para respetar foreign keys
  await supabase.from('swipes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('velvet_users').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // Vaciar el bucket de fotos
  const { data: files } = await supabase.storage.from('velvet-photos').list()
  if (files && files.length > 0) {
    await supabase.storage
      .from('velvet-photos')
      .remove(files.map((f) => f.name))
  }

  return NextResponse.json({ ok: true })
}
