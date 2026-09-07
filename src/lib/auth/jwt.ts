// lib/auth/jwt.ts
//
// Signs and verifies JWTs using `jose`. We use `jose` instead of the more
// common `jsonwebtoken` package because `jsonwebtoken` relies on Node's
// crypto module in a way that doesn't work in the Edge runtime — and
// Next.js middleware (used for route protection) runs on the Edge runtime.
//
// The token payload is intentionally minimal: just enough to identify the
// user and their role for authorization checks. No sensitive data.

import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";

const secret = new TextEncoder().encode(env.JWT_SECRET);
const JWT_ALG = "HS256";
const JWT_EXPIRY = "30d"; // parents/admins stay logged in for a month

export type JwtPayload = {
    userId: string;
    role: "PARENT" | "ADMIN";
};

export async function signJwt(payload: JwtPayload): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: JWT_ALG })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRY)
        .sign(secret);
}

/**
 * Verifies a JWT and returns its payload, or null if invalid/expired.
 * Never throws — callers should treat `null` as "not authenticated".
 */
export async function verifyJwt(token: string): Promise<JwtPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret);
        // Basic shape check since jwtVerify returns `JWTPayload` (generic record)
        if (
            typeof payload.userId === "string" &&
            (payload.role === "PARENT" || payload.role === "ADMIN")
        ) {
            return { userId: payload.userId, role: payload.role };
        }
        return null;
    } catch {
        return null;
    }
}