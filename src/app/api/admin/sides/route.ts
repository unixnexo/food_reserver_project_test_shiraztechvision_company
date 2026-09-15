// src/app/api/admin/sides/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Side/topping bank management (e.g. موز, نوشابه) — the reusable list
// parents can optionally attach to a reserved meal, any number of them.
// Unlike Food, sides are NOT scheduled per-date; they're always available
// to attach to any OrderItem. ADMIN-only.
//
// GET RESPONSE (200):
//   { "success": true, "sides": [{ "id": string, "name": string }, ...] }
//
// POST REQUEST BODY (JSON): { "name": string }
// POST RESPONSE (201): { "success": true, "side": { "id": string, "name": string } }
// POST RESPONSE (409) — duplicate side name:
//   { "success": false, "error": "این آیتم قبلا ثبت شده است" }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSideSchema } from "@/lib/validations/side";
import { Prisma } from "@prisma/client";

export async function GET() {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const sides = await prisma.side.findMany({
        orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, sides });
}

export async function POST(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const body = await request.json().catch(() => null);
    const parsed = createSideSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    try {
        const side = await prisma.side.create({ data: parsed.data });
        return NextResponse.json({ success: true, side }, { status: 201 });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { success: false, error: "این آیتم قبلا ثبت شده است" },
                { status: 409 }
            );
        }
        throw error;
    }
}