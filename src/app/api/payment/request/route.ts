// src/app/api/payment/request/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Called right after an order is created (DAILY or MONTHLY, status
// PENDING) to start the Zarinpal payment flow. Requires the requesting
// user to own the order.
//
// REQUEST BODY (JSON):
//   { "orderId": string }
//
// RESPONSE (200):
//   { "success": true, "paymentUrl": string }
//   → frontend should immediately do `window.location.href = paymentUrl`
//
// RESPONSE (400) — order not in PENDING state (already paid/failed):
//   { "success": false, "error": "این سفارش قابل پرداخت نیست" }
//
// RESPONSE (404):
//   { "success": false, "error": "سفارش یافت نشد" }
//
// On success, stores the Zarinpal `Authority` on the Order so the
// callback route can match the return trip back to this specific order.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { requestPayment } from "@/lib/payment/zarinpal";
import { env } from "@/lib/env";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { success: false, error: "ابتدا وارد شوید" },
            { status: 401 }
        );
    }

    const body = await request.json().catch(() => null);
    const orderId = body?.orderId;

    if (!orderId || typeof orderId !== "string") {
        return NextResponse.json(
            { success: false, error: "شناسه سفارش الزامی است" },
            { status: 400 }
        );
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true },
    });

    if (!order || order.userId !== session.userId) {
        return NextResponse.json(
            { success: false, error: "سفارش یافت نشد" },
            { status: 404 }
        );
    }

    if (order.status !== "PENDING") {
        return NextResponse.json(
            { success: false, error: "این سفارش قابل پرداخت نیست" },
            { status: 400 }
        );
    }

    const callbackUrl = `${env.APP_BASE_URL}/api/payment/callback`;

    const result = await requestPayment({
        amountToman: order.totalAmount,
        description: `رزرو غذای مدرسه - سفارش ${order.id}`,
        callbackUrl,
        mobile: order.user.phone,
    });

    if (!result.ok) {
        return NextResponse.json(
            { success: false, error: result.error },
            { status: 502 }
        );
    }

    await prisma.order.update({
        where: { id: order.id },
        data: { paymentAuthority: result.authority },
    });

    return NextResponse.json({ success: true, paymentUrl: result.paymentUrl });
}