import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Renamed from `middleware.ts` for Next.js 16 (the `middleware` convention is
// deprecated in favour of `proxy`). Runs on the Node.js runtime — fine here,
// since `getToken` only reads and verifies the NextAuth JWT cookie.
export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isLogin = pathname === "/admin/login";
  const isAdminArea = pathname.startsWith("/admin");

  if (!token && isAdminArea && !isLogin) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (token && isLogin) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
