import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Redirigir a la raíz del mismo dominio
  const url = new URL(req.url)
  const response = NextResponse.redirect(
    `${url.protocol}//${url.host}/`,
    { status: 303 },
  )
  response.cookies.delete('velvet_user_id')
  response.cookies.delete('velvet_user_id_v2')
  return response
}
