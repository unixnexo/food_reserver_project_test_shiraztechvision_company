// middleware.ts
//
// PURPOSE (for AI agents / future readers):
// Runs on the Edge runtime before every matched request. Reads the
// "session" JWT cookie and:
//   1. Redirects unauthenticated users away from protected routes to /login
//   2. Redirects PARENT users away from /admin/** routes
//   3. Redirects already-authenticated users away from /login to their panel
//
// This is authorization only — it does NOT hit the database. The JWT
// payload (userId, role) is trusted because it was signed by us in
// verify-otp/route.ts and verified here with the same secret.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth/jwt";

const SESSION_COOKIE_NAME = "session";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const payload = token ? await verifyJwt(token) : null;

    const isLoginPage = pathname === "/login";
    const isAdminRoute = pathname.startsWith("/admin");
    const isParentDashboard = pathname.startsWith("/dashboard");

    // Not logged in, trying to reach a protected route → send to login
    if (!payload && (isAdminRoute || isParentDashboard)) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Logged in, but trying to view the login page → send to their panel
    if (payload && isLoginPage) {
        const destination = payload.role === "ADMIN" ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(destination, request.url));
    }

    // Logged in as PARENT, trying to reach /admin/** → block
    if (payload && payload.role === "PARENT" && isAdminRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/login", "/dashboard/:path*", "/admin/:path*"],
};