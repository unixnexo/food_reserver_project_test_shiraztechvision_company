// src/app/api/reservations/cancel/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Parent cancels ONE reserved meal (one OrderItem — one child, one day).
// This is NOT whole-order cancellation — a multi-day order can have
// individual days cancelled independently.
//
// RULES ENFORCED HERE (on top of the shared core in
// lib/reservation/cancel-order-item.ts):
// 1. The item must belong to a child of the requesting parent.
// 2. The parent order must be PAID (a PENDING/FAILED order was never
//    charged, so there's nothing to "cancel" in the refund sense — the
//    parent just abandons it by not paying).
// 3. The item's date must still be within the modification cutoff — same
//    5pm-today/tomorrow rule as new bookings (see
//    lib/reservation/modification-cutoff.ts). Once that window closes,
//    the kitchen has already committed to preparing that meal.
//
// REQUEST BODY (JSON): { "orderItemId": string }
// RESPONSE (200): { "success": true, "refundedAmount": number }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { cancelOrderItemSchema } from "@/lib/validations/cancel-order-item";
import { cancelOrderItem } from "@/lib/reservation/cancel-order-item";
import { canModifyReservationForDate } from "@/lib/reservation/modification-cutoff";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { success: false, error: "ابتدا وارد شوید" },
            { status: 401 }
        );
    }

    const body = await request.json().catch(() => null);
    const parsed = cancelOrderItemSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const item = await prisma.orderItem.findUnique({
        where: { id: parsed.data.orderItemId },
        include: { order: true },
    });

    if (!item || item.order.userId !== session.userId) {
        return NextResponse.json(
            { success: false, error: "سفارش یافت نشد" },
            { status: 404 }
        );
    }

    if (item.status === "CANCELLED") {
        return NextResponse.json(
            { success: false, error: "این سفارش قبلا لغو شده است" },
            { status: 400 }
        );
    }

    if (item.order.status !== "PAID") {
        return NextResponse.json(
            { success: false, error: "این سفارش قابل لغو نیست" },
            { status: 400 }
        );
    }

    if (!canModifyReservationForDate(item.date, new Date())) {
        return NextResponse.json(
            {
                success: false,
                error: "مهلت لغو این رزرو به پایان رسیده است (تا ساعت ۱۷ روز قبل)",
            },
            { status: 400 }
        );
    }

    const result = await cancelOrderItem(
        item.id,
        "لغو توسط والد",
        session.userId
    );

    if (!result.ok) {
        return NextResponse.json(
            { success: false, error: result.error },
            { status: result.status }
        );
    }

    return NextResponse.json({
        success: true,
        refundedAmount: result.refundedAmount,
    });
}