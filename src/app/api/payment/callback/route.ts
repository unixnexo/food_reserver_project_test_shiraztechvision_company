// src/app/api/payment/callback/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Zarinpal redirects the user's browser here after they complete (or
// cancel) payment at the gateway. This is a GET route (Zarinpal appends
// query params, not a POST body) — see the callback_url passed in
// /api/payment/request.
//
// QUERY PARAMS (set by Zarinpal):
//   ?Authority=<string>&Status=OK|NOK
//
// BEHAVIOR:
// - Status=NOK (user cancelled, or payment failed at gateway) → mark the
//   matching Order as FAILED, redirect to /dashboard/orders/[id]/result?status=failed
// - Status=OK → call Zarinpal's verify endpoint. If verified (code 100 or
//   101 — see lib/payment/zarinpal.ts), mark the Order PAID, generate a
//   tracking code, redirect to the result page with status=success.
//   If verify fails, mark FAILED, redirect with status=failed.
//
// IDEMPOTENCY: if the order is ALREADY marked PAID (e.g. Zarinpal calls
// back twice, or the user refreshes this URL), we skip re-verification
// entirely and just redirect to the existing result — never double-charge
// side effects or overwrite an existing trackingCode/refId.
//
// This route intentionally redirects (not JSON) since it's a browser
// navigation target, not an API call from our own frontend code.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/lib/payment/zarinpal";
import { generateTrackingCode } from "@/lib/payment/tracking-code";
import { env } from "@/lib/env";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const authority = searchParams.get("Authority");
    const status = searchParams.get("Status");

    if (!authority) {
        return NextResponse.redirect(`${env.APP_BASE_URL}/dashboard`);
    }

    const order = await prisma.order.findFirst({
        where: { paymentAuthority: authority },
    });

    if (!order) {
        return NextResponse.redirect(`${env.APP_BASE_URL}/dashboard`);
    }

    const resultUrl = (outcome: "success" | "failed") =>
        `${env.APP_BASE_URL}/dashboard/orders/${order.id}/result?status=${outcome}`;

    // Idempotency: already finalized, don't re-process.
    if (order.status === "PAID") {
        return NextResponse.redirect(resultUrl("success"));
    }
    if (order.status === "FAILED") {
        return NextResponse.redirect(resultUrl("failed"));
    }

    if (status !== "OK") {
        await prisma.order.update({
            where: { id: order.id },
            data: { status: "FAILED" },
        });
        return NextResponse.redirect(resultUrl("failed"));
    }

    const verifyResult = await verifyPayment({
        amountToman: order.totalAmount,
        authority,
    });

    if (!verifyResult.ok) {
        await prisma.order.update({
            where: { id: order.id },
            data: { status: "FAILED" },
        });
        return NextResponse.redirect(resultUrl("failed"));
    }

    await prisma.order.update({
        where: { id: order.id },
        data: {
            status: "PAID",
            paymentRefId: String(verifyResult.refId),
            trackingCode: generateTrackingCode(),
        },
    });

    return NextResponse.redirect(resultUrl("success"));
}