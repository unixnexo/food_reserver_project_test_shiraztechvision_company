// src/app/api/admin/foods/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Food bank management — the reusable list of dishes admin assigns to
// specific menu days (see /api/admin/menu-items). ADMIN-only.
//
// GET RESPONSE (200):
//   { "success": true, "foods": [{ "id": string, "name": string }, ...] }
//
// POST REQUEST BODY (JSON):
//   { "name": string }
//
// POST RESPONSE (201):
//   { "success": true, "food": { "id": string, "name": string } }
//
// POST RESPONSE (409) — duplicate food name:
//   { "success": false, "error": "این غذا قبلا ثبت شده است" }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createFoodSchema } from "@/lib/validations/food";
import { Prisma } from "@prisma/client";

export async function GET() {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const foods = await prisma.food.findMany({
        orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, foods });
}

export async function POST(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const body = await request.json().catch(() => null);
    const parsed = createFoodSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    try {
        const food = await prisma.food.create({ data: parsed.data });
        return NextResponse.json({ success: true, food }, { status: 201 });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { success: false, error: "این غذا قبلا ثبت شده است" },
                { status: 409 }
            );
        }
        throw error;
    }
}