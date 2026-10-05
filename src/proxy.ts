// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { currentAccess } from "@/lib/auth";
// import { canAccess, routePermission } from "@/lib/permissions";

// // Renamed from `middleware.ts` for Next.js 16 (the `middleware` convention is
// // deprecated in favour of `proxy`). Runs on the Node.js runtime — which is what
// // lets us verify the token AND check its version against the database here
// // (Prisma can't run on the edge). Verifying at this layer means a token that's
// // been invalidated ("log out all devices" / password change) is bounced to the
// // login screen before any admin page renders, not just blocked at the actions.
// export async function proxy(req: NextRequest) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   const { pathname } = req.nextUrl;

//   const isLogin = pathname === "/admin/login";
//   const isAdminArea = pathname.startsWith("/admin");

//   // A token is "authed" only if it exists AND its version still matches the
//   // account. Legacy tokens (no uid/ver, minted before versioning) count as
//   // stale, so the admin re-logs in once after this ships.
//   let authed = false;
//   let access = null;
//   if (token?.uid && typeof token.ver === "number") {
//     access = await currentAccess(token.uid as string);
//     authed = access !== null && access.tokenVersion === token.ver;
//   }

//   if (!authed && isAdminArea && !isLogin) {
//     const loginUrl = new URL("/admin/login", req.url);
//     loginUrl.searchParams.set("callbackUrl", pathname);
//     return NextResponse.redirect(loginUrl);
//   }
//   if (authed && isLogin) {
//     return NextResponse.redirect(new URL("/admin/dashboard", req.url));
//   }
//   const permission = routePermission(pathname);
//   if (authed && access && permission && !canAccess(access, permission)) return NextResponse.redirect(new URL("/admin/access-denied", req.url));
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*"],
// };


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Lightweight admin routing guard.
 *
 * IMPORTANT:
 * Do not import Prisma, auth.ts, db.ts, settings.ts, or anything else
 * that can eventually import Prisma from this file.
 *
 * Database-backed authentication/authorization is performed by the
 * server-side admin layout and API/server actions.
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLogin = pathname === "/admin/login";
  const isAdminArea = pathname.startsWith("/admin");

  // This is only the first routing guard.
  // The server-side admin layout performs the authoritative DB check.
  const authed = Boolean(
    token?.uid &&
    typeof token.ver === "number"
  );

  if (!authed && isAdminArea && !isLogin) {
    const loginUrl = new URL("/admin/login", req.url);

    loginUrl.searchParams.set(
      "callbackUrl",
      pathname + search
    );

    return NextResponse.redirect(loginUrl);
  }

  if (authed && isLogin) {
    return NextResponse.redirect(
      new URL("/admin/dashboard", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};