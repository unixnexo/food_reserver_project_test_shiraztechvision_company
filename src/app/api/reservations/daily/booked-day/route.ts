// src/app/api/reservations/daily/booked-day/route.ts
//
// Returns the reserved food, portion size, and price for a SPECIFIC
// child on a SPECIFIC date — used by the daily reservation calendar's
// popover when a parent taps an already-booked (blue) day, so they can
// see what was ordered without navigating away.
//
// GET /api/reservations/daily/booked-day?childId=...&date=YYYY-MM-DD
//
// RESPONSE (200):
//   {
//     "success": true,
//     "booking": {
//       "foodName": string,
//       "portionType": "HALF" | "FULL",
//       "price": number,
//       "orderStatus": "PENDING" | "PAID" | "FAILED"
//     } | null
//   }

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { toDateOnly } from "@/lib/date/normalize";

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
    const dateParam = searchParams.get("date");

    if (!childId || !dateParam) {
        return NextResponse.json(
            { success: false, error: "پارامترهای نامعتبر" },
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

    const date = toDateOnly(new Date(dateParam));

    const orderItem = await prisma.orderItem.findFirst({
        where: { childId, date },
        include: {
            menuItem: { include: { food: true } },
            order: { select: { status: true } },
        },
    });

    if (!orderItem) {
        return NextResponse.json({ success: true, booking: null });
    }

    return NextResponse.json({
        success: true,
        booking: {
            foodName: orderItem.menuItem.food.name,
            portionType: orderItem.portionType,
            price: orderItem.unitPrice,
            orderStatus: orderItem.order.status,
        },
    });
}
