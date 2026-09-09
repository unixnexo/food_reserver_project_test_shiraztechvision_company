// src/app/api/reservations/daily/booked-dates/route.ts
//
// Returns every date within a given Jalali month range that already has
// an order item for the given child (any order status — a PENDING order
// still occupies that day, same rule create-order.ts enforces at
// submission). Used by the daily reservation calendar to show already-
// booked days in blue and block them from being re-selected, since a
// child can only have one reservation per day system-wide.
//
// GET /api/reservations/daily/booked-dates?childId=...
//
// RESPONSE (200):
//   { "success": true, "bookedDates": ["YYYY-MM-DD", ...] }

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getCurrentJalaliMonthRange } from "@/lib/reservation/month-range";
import { toDateParam } from "@/lib/date/normalize";

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

    const { start, end } = getCurrentJalaliMonthRange(new Date());

    const orderItems = await prisma.orderItem.findMany({
        where: {
            childId,
            date: { gte: start, lte: end },
        },
        select: { date: true },
    });

    return NextResponse.json({
        success: true,
        bookedDates: orderItems.map((oi) => toDateParam(oi.date)),
    });
}