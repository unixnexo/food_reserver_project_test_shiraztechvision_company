// src/app/api/auth/logout/route.ts
//
// PAGE/ROUTE PURPOSE:
// Clears the session cookie. No request body needed.
//
// RESPONSE (200):
//   { "success": true }

import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "session";

export async function POST() {
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });
    return response;
}