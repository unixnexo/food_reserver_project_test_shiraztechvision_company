// src/lib/auth/session.ts
//
// Server-side helper for API routes and Server Components to get the
// current logged-in user's identity from the session cookie. Returns null
// if not logged in or the token is invalid/expired — callers decide how to
// respond (401, redirect, etc).

import { cookies } from "next/headers";
import { verifyJwt, type JwtPayload } from "./jwt";

const SESSION_COOKIE_NAME = "session";

export async function getSession(): Promise<JwtPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJwt(token);
}