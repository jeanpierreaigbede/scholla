import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "schola_token";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/learn",
  "/stats",
  "/flashcards",
  "/subscribe",
  "/onboarding",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    "/stats/:path*",
    "/flashcards/:path*",
    "/subscribe/:path*",
    "/onboarding/:path*",
  ],
};
