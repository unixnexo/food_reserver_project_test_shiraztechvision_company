// src/lib/auth/require-admin.ts
//
// Shared guard for admin-only API routes. Returns the session if the
// caller is a logged-in ADMIN, or a ready-to-return NextResponse (401/403)
// otherwise. Usage in a route:
//
//   const result = await requireAdmin();
//   if (result instanceof NextResponse) return result;
//   const session = result; // typed as JwtPayload with role: "ADMIN"

import { NextResponse } from "next/server";
import { getSession } from "./session";
import type { JwtPayload } from "./jwt";

export async function requireAdmin(): Promise<
    NextResponse | (JwtPayload & { role: "ADMIN" })
> {
    const session = await getSession();

    if (!session) {
        return NextResponse.json(
            { success: false, error: "ابتدا وارد شوید" },
            { status: 401 }
        );
    }

    if (session.role !== "ADMIN") {
        return NextResponse.json(
            { success: false, error: "دسترسی غیرمجاز" },
            { status: 403 }
        );
    }

    return session as JwtPayload & { role: "ADMIN" };
}