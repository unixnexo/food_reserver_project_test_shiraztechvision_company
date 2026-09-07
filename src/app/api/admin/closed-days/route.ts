// src/app/api/admin/closed-days/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Manages EXTRA closed dates beyond the default Thu/Fri closure (see
// lib/school-calendar/is-school-day.ts for the full rule). ADMIN-only.
// Admin can only ADD closures — there is no "reopen a Thursday" feature
// per product decision.
//
// GET RESPONSE (200):
//   { "success": true, "closedDays": [{ "id", "date", "reason" }, ...] }
//   (all closed days, ordered by date ascending — UI can filter by month client-side)
//
// POST REQUEST BODY (JSON):
//   { "date": "YYYY-MM-DD", "reason"?: string }
// POST RESPONSE (201):
//   { "success": true, "closedDay": { "id", "date", "reason" } }
// POST RESPONSE (409) — already Thursday/Friday (redundant) or already closed:
//   { "success": false, "error": "<Persian message>" }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClosedDaySchema } from "@/lib/validations/closed-day";
import { toDateOnly } from "@/lib/date/normalize";
import { Prisma } from "@prisma/client";

const THURSDAY = 4;
const FRIDAY = 5;

export async function GET() {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const closedDays = await prisma.closedDay.findMany({
        orderBy: { date: "asc" },
    });

    return NextResponse.json({ success: true, closedDays });
}

export async function POST(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const body = await request.json().catch(() => null);
    const parsed = createClosedDaySchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const date = toDateOnly(parsed.data.date);
    const dayOfWeek = date.getUTCDay();

    if (dayOfWeek === THURSDAY || dayOfWeek === FRIDAY) {
        return NextResponse.json(
            {
                success: false,
                error: "پنجشنبه و جمعه به صورت پیش‌فرض تعطیل است",
            },
            { status: 409 }
        );
    }

    try {
        const closedDay = await prisma.closedDay.create({
            data: { date, reason: parsed.data.reason },
        });

        return NextResponse.json({ success: true, closedDay }, { status: 201 });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { success: false, error: "این روز قبلا تعطیل شده است" },
                { status: 409 }
            );
        }
        throw error;
    }
}