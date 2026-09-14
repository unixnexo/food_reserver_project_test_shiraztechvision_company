// src/lib/reservation/edit-order-item.ts
//
// Core logic for a parent changing WHICH FOOD is booked for an
// already-placed reservation (one OrderItem). Per the spec: only the food
// choice can change — NOT the portion type (HALF/FULL stays locked, since
// that's tied to the price already paid) and NOT the date (moving to a
// different day is a cancel + new booking, not an edit).
//
// AUTHORIZATION AND CUTOFF ENFORCEMENT ARE THE CALLER'S RESPONSIBILITY —
// mirrors the same split used in cancel-order-item.ts. The parent-facing
// route checks ownership + the 5pm/tomorrow cutoff before calling this.
//
// No price change happens here: unitPrice is a snapshot from when the
// order was placed and intentionally stays untouched on a food swap
// (same portionType -> same price by definition, since price is priced
// per portion size, not per specific food).

import { prisma } from "@/lib/prisma";
import { toDateOnly } from "@/lib/date/normalize";
import { getSmsSender } from "@/lib/sms/sms-sender";
import { orderEditedMessage } from "@/lib/sms/templates";

export type EditOrderItemResult =
    | { ok: true }
    | { ok: false; error: string; status: number };

export async function editOrderItem(
    orderItemId: string,
    newMenuItemId: string
): Promise<EditOrderItemResult> {
    const item = await prisma.orderItem.findUnique({
        where: { id: orderItemId },
        include: { order: { include: { user: true } } },
    });

    if (!item) {
        return { ok: false, error: "سفارش یافت نشد", status: 404 };
    }

    if (item.status !== "ACTIVE") {
        return { ok: false, error: "این سفارش لغو شده و قابل ویرایش نیست", status: 400 };
    }

    if (item.order.status !== "PAID") {
        return { ok: false, error: "این سفارش قابل ویرایش نیست", status: 400 };
    }

    const newMenuItem = await prisma.menuItem.findUnique({
        where: { id: newMenuItemId },
    });

    if (!newMenuItem) {
        return { ok: false, error: "غذای انتخاب شده یافت نشد", status: 404 };
    }

    // The new food choice must be on the SAME calendar day as the
    // reservation being edited — swapping food is allowed, moving the
    // meal to a different date is not (that's cancel + rebook instead).
    if (newMenuItem.date.getTime() !== toDateOnly(item.date).getTime()) {
        return {
            ok: false,
            error: "غذای انتخاب شده برای این تاریخ معتبر نیست",
            status: 400,
        };
    }

    if (newMenuItem.id === item.menuItemId) {
        // Nothing to change — not an error, just a no-op the caller can
        // treat as success without hitting the DB.
        return { ok: true };
    }

    await prisma.orderItem.update({
        where: { id: item.id },
        data: { menuItemId: newMenuItem.id },
    });

    await getSmsSender().send(item.order.user.phone, orderEditedMessage());

    return { ok: true };
}