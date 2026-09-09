// src/app/api/reservations/monthly/existing/route.ts
//
// Checks whether a child already has ANY order item(s) within next
// Jalali month — used by the monthly reservation flow's UI to block
// the parent up front (right after picking a child) instead of letting
// them go through the whole food-selection flow only to be rejected at
// final submission. Mirrors the same check create-order.ts enforces at
// the DB level, so front-end and back-end never disagree.
//
// GET /api/reservations/monthly/existing?childId=...
//
// RESPONSE (200):
//   { "success": true, "hasExistingReservation": boolean }

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getNextJalaliMonthRange } from "@/lib/reservation/month-range";

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { success: false, error: "ابتدا وارد شوید" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");

    if (!childId) {
        return NextResponse.json(
            { success: false, error: "شناسه فرزند ارسال نشده است" },
            { status: 400 }
        );
    }

    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child || child.parentId !== session.userId) {
        return NextResponse.json(
            { success: false, error: "فرزند مورد نظر یافت نشد" },
            { status: 404 }
        );
    }

    const { start, end } = getNextJalaliMonthRange(new Date());

    const existingCount = await prisma.orderItem.count({
        where: {
            childId,
            date: { gte: start, lte: end },
        },
    });

    return NextResponse.json({
        success: true,
        hasExistingReservation: existingCount > 0,
    });
}