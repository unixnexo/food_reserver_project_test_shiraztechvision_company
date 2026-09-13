// src/app/api/reservations/monthly/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Creates a MONTHLY reservation order for one child, covering every
// school day in NEXT Jalali month, each with a chosen menu item +
// portion size. Structurally identical to POST /api/reservations/daily
// (both delegate to lib/reservation/create-order.ts) — the only
// difference is the date-range rule (next-month-only, no cutoff) applied
// inside that shared function based on the "MONTHLY" type passed here.
//
// REQUEST BODY (JSON):
//   {
//     "childId": string,
//     "items": [
//       { "date": "YYYY-MM-DD", "menuItemId": string, "portionType": "HALF" | "FULL" },
//       ...
//     ]
//   }
//
// RESPONSE (201):
//   { "success": true, "orderId": string, "totalAmount": number }
//
// RESPONSE (400/404/409/500):
//   { "success": false, "error": "<Persian message>" }

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createMonthlyOrderSchema } from "@/lib/validations/monthly-order";
import { createOrder } from "@/lib/reservation/create-order";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { success: false, error: "ابتدا وارد شوید" },
            { status: 401 }
        );
    }

    const body = await request.json().catch(() => null);
    const parsed = createMonthlyOrderSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const result = await createOrder(
        session.userId,
        "MONTHLY",
        parsed.data.childId,
        parsed.data.items,
        new Date(),
        parsed.data.paymentMethod
    );

    if (!result.ok) {
        return NextResponse.json(
            { success: false, error: result.error },
            { status: result.status }
        );
    }

    return NextResponse.json(
        {
            success: true,
            orderId: result.orderId,
            totalAmount: result.totalAmount,
            status: result.status,
        },
        { status: 201 }
    );
}