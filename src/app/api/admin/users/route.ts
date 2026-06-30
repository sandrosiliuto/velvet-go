import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

function checkPassword(req: NextRequest) {
  const pw = req.nextUrl.searchParams.get('pw')
  return pw === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkPassword(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: users, error } = await supabase
    .from('velvet_users')
    .select('id, name, phone, photo_url, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users })
}
