// src/app/api/admin/reservations/cancel/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Admin cancels ONE reserved meal (one OrderItem) on a parent's behalf —
// e.g. the kitchen ran out of a dish, a school closed unexpectedly, etc.
// ADMIN-only. Unlike the parent-facing cancel route
// (app/api/reservations/cancel/route.ts), this has NO cutoff restriction
// (an admin can cancel any day, past or future) but DOES require a
// توضیحات reason, since the parent will see it in their SMS/wallet ledger.
//
// Shares the exact same refund + SMS + order-status core as the parent
// route (lib/reservation/cancel-order-item.ts) — only the authorization
// rule and the mandatory reason differ.
//
// REQUEST BODY (JSON): { "orderItemId": string, "reason": string }
// RESPONSE (200): { "success": true, "refundedAmount": number }

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminCancelOrderItemSchema } from "@/lib/validations/admin-cancel-order-item";
import { cancelOrderItem } from "@/lib/reservation/cancel-order-item";

export async function POST(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const body = await request.json().catch(() => null);
    const parsed = adminCancelOrderItemSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const result = await cancelOrderItem(
        parsed.data.orderItemId,
        parsed.data.reason,
        admin.userId
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