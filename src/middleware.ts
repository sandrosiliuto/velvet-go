import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const userId = request.cookies.get("velvet_user_id")?.value;
  const pathname = request.nextUrl.pathname;

  // Redirigir / a /discover si hay cookie
  if (pathname === "/" && userId) {
    return NextResponse.redirect(new URL("/discover", request.url));
  }

  // Proteger rutas que requieren autenticación
  const protectedRoutes = ["/discover", "/matches"];
  if (protectedRoutes.includes(pathname) && !userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/discover", "/matches"],
};
