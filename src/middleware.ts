import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userId = request.cookies.get('velvet_user_id')?.value

  // /discover requiere registro
  if (pathname.startsWith('/discover') && !userId) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Si ya está registrado y va a la raíz, manda a /discover
  if (pathname === '/' && userId) {
    return NextResponse.redirect(new URL('/discover', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/discover/:path*'],
}
