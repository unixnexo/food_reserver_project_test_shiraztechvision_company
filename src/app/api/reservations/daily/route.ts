// src/app/api/reservations/daily/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Creates a DAILY reservation order for one child, across one or more
// selected dates, each with a chosen menu item + portion size. This is
// the "commit" step of the daily reservation flow — after this succeeds,
// the order is PENDING and the frontend should proceed to payment
// (Step 8 — Zarinpal). All business-rule validation is delegated to
// lib/reservation/create-daily-order.ts (kept separate for unit testing).
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
// RESPONSE (400/404/409/500) — see create-daily-order.ts for exact cases:
//   { "success": false, "error": "<Persian message>" }

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createDailyOrderSchema } from "@/lib/validations/order";
import { createDailyOrder } from "@/lib/reservation/create-daily-order";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { success: false, error: "ابتدا وارد شوید" },
            { status: 401 }
        );
    }

    const body = await request.json().catch(() => null);
    const parsed = createDailyOrderSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const result = await createDailyOrder(
        session.userId,
        parsed.data,
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