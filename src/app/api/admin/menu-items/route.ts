// src/app/api/admin/menu-items/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Manages which foods (from the food bank) are offered on a given
// calendar date — this is what parents see and choose from when
// reserving. ADMIN-only.
//
// GET QUERY PARAM:
//   ?date=YYYY-MM-DD
// GET RESPONSE (200):
//   { "success": true, "menuItems": [{ "id": string, "food": { "id", "name" } }, ...] }
//
// POST REQUEST BODY (JSON):
//   { "date": "YYYY-MM-DD", "foodId": string }
// POST RESPONSE (201):
//   { "success": true, "menuItem": { "id", "date", "foodId" } }
// POST RESPONSE (409) — that food is already assigned to that date:
//   { "success": false, "error": "این غذا قبلا برای این روز ثبت شده است" }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createMenuItemSchema } from "@/lib/validations/menu-item";
import { toDateOnly } from "@/lib/date/normalize";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
        return NextResponse.json(
            { success: false, error: "پارامتر تاریخ الزامی است" },
            { status: 400 }
        );
    }

    const date = toDateOnly(new Date(dateParam));

    const menuItems = await prisma.menuItem.findMany({
        where: { date },
        include: { food: true },
    });

    return NextResponse.json({ success: true, menuItems });
}

export async function POST(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const body = await request.json().catch(() => null);
    const parsed = createMenuItemSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const date = toDateOnly(parsed.data.date);

    try {
        const menuItem = await prisma.menuItem.create({
            data: { date, foodId: parsed.data.foodId },
            include: { food: true },
        });

        return NextResponse.json({ success: true, menuItem }, { status: 201 });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "این غذا قبلا برای این روز ثبت شده است",
                },
                { status: 409 }
            );
        }
        throw error;
    }
}