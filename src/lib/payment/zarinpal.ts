// src/lib/payment/zarinpal.ts
//
// Thin client for Zarinpal's v4 REST API, configured for SANDBOX mode.
// To go live later: change ZARINPAL_BASE_URL to the production host
// (https://payment.zarinpal.com) and set a real ZARINPAL_MERCHANT_ID in
// .env — no other code changes needed, since every caller goes through
// this module.
//
// API REFERENCE (verified against Zarinpal's official docs, v4):
//   Request: POST {base}/pg/v4/payment/request.json
//   Verify:  POST {base}/pg/v4/payment/verify.json
//   Redirect user to: {base}/pg/StartPay/{authority}
//
// currency is explicitly "IRT" (Toman) on every request — Zarinpal's API
// defaults to Rial if omitted, and this project stores/displays all
// amounts in تومن throughout, so this must never be left implicit.
//
// IMPORTANT: code 100 = verified successfully (first time). code 101 =
// already verified previously (Zarinpal's own idempotency signal) — both
// should be treated as "payment is valid," but only code 100 should ever
// trigger fulfillment side-effects for the FIRST time. Our own
// Order.status check (see verify-payment.ts) is what actually guards
// against double-fulfillment; treating 101 as a benign repeat here.

import { env } from "@/lib/env";

const ZARINPAL_BASE_URL = "https://sandbox.zarinpal.com";

type ZarinpalRequestResponse = {
    data: {
        code: number;
        message: string;
        authority: string;
    };
    errors: unknown[];
};

type ZarinpalVerifyResponse = {
    data: {
        code: number;
        message: string;
        ref_id?: number;
    };
    errors: unknown[];
};

export type PaymentRequestResult =
    | { ok: true; authority: string; paymentUrl: string }
    | { ok: false; error: string };

export async function requestPayment(params: {
    amountToman: number;
    description: string;
    callbackUrl: string;
    mobile?: string;
}): Promise<PaymentRequestResult> {
    const res = await fetch(`${ZARINPAL_BASE_URL}/pg/v4/payment/request.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            merchant_id: env.ZARINPAL_MERCHANT_ID,
            currency: "IRT",
            amount: params.amountToman,
            callback_url: params.callbackUrl,
            description: params.description,
            metadata: params.mobile ? { mobile: params.mobile } : undefined,
        }),
    });

    const body: ZarinpalRequestResponse = await res.json();

    if (body.data?.code !== 100) {
        return {
            ok: false,
            error: `خطا در اتصال به درگاه پرداخت (کد ${body.data?.code ?? "نامشخص"})`,
        };
    }

    return {
        ok: true,
        authority: body.data.authority,
        paymentUrl: `${ZARINPAL_BASE_URL}/pg/StartPay/${body.data.authority}`,
    };
}

export type VerifyPaymentResult =
    | { ok: true; refId: number; alreadyVerified: boolean }
    | { ok: false; error: string };

export async function verifyPayment(params: {
    amountToman: number;
    authority: string;
}): Promise<VerifyPaymentResult> {
    const res = await fetch(`${ZARINPAL_BASE_URL}/pg/v4/payment/verify.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            merchant_id: env.ZARINPAL_MERCHANT_ID,
            amount: params.amountToman,
            authority: params.authority,
        }),
    });

    const body: ZarinpalVerifyResponse = await res.json();

    // 100 = verified now (first time). 101 = was already verified earlier —
    // still a valid/successful payment, just not a fresh event.
    if (body.data?.code === 100 || body.data?.code === 101) {
        return {
            ok: true,
            refId: body.data.ref_id ?? 0,
            alreadyVerified: body.data.code === 101,
        };
    }

    return {
        ok: false,
        error: `پرداخت تایید نشد (کد ${body.data?.code ?? "نامشخص"})`,
    };
}