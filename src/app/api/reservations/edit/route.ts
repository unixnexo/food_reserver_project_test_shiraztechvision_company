// src/app/api/reservations/edit/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Parent changes WHICH FOOD is booked for one already-placed reservation
// (one OrderItem). Portion type and date cannot change through this route
// — only the food choice, and only within the same modification cutoff
// window used for cancellation (5pm today / tomorrow only — see
// lib/reservation/modification-cutoff.ts).
//
// REQUEST BODY (JSON): { "orderItemId": string, "newMenuItemId": string }
// RESPONSE (200): { "success": true }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { editOrderItemSchema } from "@/lib/validations/edit-order-item";
import { editOrderItem } from "@/lib/reservation/edit-order-item";
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
    const parsed = editOrderItemSchema.safeParse(body);

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

    if (item.status !== "ACTIVE") {
        return NextResponse.json(
            { success: false, error: "این سفارش لغو شده و قابل ویرایش نیست" },
            { status: 400 }
        );
    }

    if (item.order.status !== "PAID") {
        return NextResponse.json(
            { success: false, error: "این سفارش قابل ویرایش نیست" },
            { status: 400 }
        );
    }

    if (!canModifyReservationForDate(item.date, new Date())) {
        return NextResponse.json(
            {
                success: false,
                error: "مهلت ویرایش این رزرو به پایان رسیده است (تا ساعت ۱۷ روز قبل)",
            },
            { status: 400 }
        );
    }

    const result = await editOrderItem(item.id, parsed.data.newMenuItemId);

    if (!result.ok) {
        return NextResponse.json(
            { success: false, error: result.error },
            { status: result.status }
        );
    }

    return NextResponse.json({ success: true });
}