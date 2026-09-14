// src/lib/reservation/cancel-order-item.ts
//
// Shared core logic for cancelling ONE reserved meal (one OrderItem — one
// child, one day) — used by BOTH the parent self-cancel flow and the
// admin-cancel flow (Step 8). Cancelling is per-item, not per-order: a
// parent with a 5-day order can cancel just one day without touching the
// rest.
//
// WHAT HAPPENS ON CANCEL:
// 1. The OrderItem is marked CANCELLED (not deleted) — keeps history for
//    reports and lets the same child+date be rebooked afterwards (the
//    partial unique index only protects ACTIVE rows).
// 2. If the parent order was PAID, the item's unitPrice is refunded to
//    the parent's wallet (money only ever flows INTO the wallet from a
//    cancellation — parents can't get it back to their bank account).
// 3. If that was the last ACTIVE item on the order, the order itself
//    moves to CANCELLED (nothing left to serve, keeps order.status
//    meaningful instead of leaving a PAID order with zero active items).
// 4. An SMS is sent to the parent with the reason, amount refunded, and
//    new wallet balance.
//
// AUTHORIZATION AND CUTOFF ENFORCEMENT ARE THE CALLER'S RESPONSIBILITY —
// this function only checks that the item exists and is still ACTIVE.
// The parent-facing route additionally checks ownership + the 5pm/tomorrow
// cutoff; the admin route additionally requires a توضیحات reason. Keeping
// those checks in the callers (not here) is what lets one admin action
// and one parent action share this same core without either accidentally
// bypassing the other's specific rules.

import { prisma } from "@/lib/prisma";
import { adjustWallet } from "@/lib/wallet/adjust-wallet";
import { getSmsSender } from "@/lib/sms/sms-sender";
import { orderCancelledMessage } from "@/lib/sms/templates";

export type CancelOrderItemResult =
    | { ok: true; refundedAmount: number }
    | { ok: false; error: string; status: number };

export async function cancelOrderItem(
    orderItemId: string,
    reason: string,
    cancelledByUserId: string
): Promise<CancelOrderItemResult> {
    const item = await prisma.orderItem.findUnique({
        where: { id: orderItemId },
        include: { order: { include: { user: true } } },
    });

    if (!item) {
        return { ok: false, error: "سفارش یافت نشد", status: 404 };
    }

    if (item.status === "CANCELLED") {
        return { ok: false, error: "این سفارش قبلا لغو شده است", status: 400 };
    }

    const wasPaid = item.order.status === "PAID";

    const result = await prisma.$transaction(async (tx) => {
        await tx.orderItem.update({
            where: { id: item.id },
            data: {
                status: "CANCELLED",
                cancelledAt: new Date(),
                cancelReason: reason,
                cancelledBy: cancelledByUserId,
            },
        });

        let newBalance: number | null = null;

        if (wasPaid) {
            const refund = await adjustWallet(
                {
                    userId: item.order.userId,
                    type: "CREDIT",
                    reason: "ORDER_REFUND",
                    amount: item.unitPrice,
                    orderId: item.orderId,
                    note: reason,
                },
                tx
            );

            if (!refund.ok) {
                // Should never happen for a CREDIT (can't go negative going
                // up), but propagate defensively rather than silently
                // continuing without a refund.
                throw new Error(refund.error);
            }

            newBalance = refund.newBalance;
        }

        // If nothing ACTIVE remains on the order, the order itself is done.
        const remainingActiveCount = await tx.orderItem.count({
            where: { orderId: item.orderId, status: "ACTIVE" },
        });

        if (remainingActiveCount === 0) {
            await tx.order.update({
                where: { id: item.orderId },
                data: { status: "CANCELLED" },
            });
        }

        return { newBalance };
    });

    if (wasPaid && result.newBalance !== null) {
        await getSmsSender().send(
            item.order.user.phone,
            orderCancelledMessage({
                reason,
                refundedAmount: item.unitPrice,
                newBalance: result.newBalance,
            })
        );
    }

    return { ok: true, refundedAmount: wasPaid ? item.unitPrice : 0 };
}