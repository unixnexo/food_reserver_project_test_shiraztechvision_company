// src/app/api/reports/my-reservations/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Returns the logged-in parent's full reservation history across ALL
// their children and ALL their orders (past and future), shaped for
// direct consumption by a calendar UI — one entry per reserved day, not
// grouped by order. Requires a logged-in session (any role, but
// meaningful only for PARENT since it's scoped to session.userId).
//
// GET RESPONSE (200):
//   {
//     "success": true,
//     "reservations": [
//       {
//         "date": "YYYY-MM-DD",           // the day the meal is FOR
//         "childId": string,
//         "childName": string,             // "firstName lastName"
//         "foodName": string,
//         "portionType": "HALF" | "FULL",
//         "amount": number,                // تومن, price snapshot at order time
//         "orderId": string,
//         "orderType": "DAILY" | "MONTHLY",
//         "orderStatus": "PENDING" | "PAID" | "FAILED",
//         "orderPlacedAt": string          // ISO datetime — when the order was created
//       },
//       ...
//     ]
//   }
//
// This is intentionally FLAT (one row per OrderItem) rather than nested
// under each Order — a calendar UI wants "what's happening on day X"
// lookups, which a flat list keyed by date serves directly without the
// consumer needing to flatten it themselves.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { success: false, error: "ابتدا وارد شوید" },
            { status: 401 }
        );
    }

    const orderItems = await prisma.orderItem.findMany({
        where: { order: { userId: session.userId } },
        include: {
            child: true,
            menuItem: { include: { food: true } },
            order: true,
        },
        orderBy: { date: "asc" },
    });

    const reservations = orderItems.map((item) => ({
        date: item.date.toISOString().split("T")[0],
        childId: item.childId,
        childName: `${item.child.firstName} ${item.child.lastName}`,
        foodName: item.menuItem.food.name,
        portionType: item.portionType,
        amount: item.unitPrice,
        orderId: item.orderId,
        orderType: item.order.type,
        orderStatus: item.order.status,
        orderPlacedAt: item.order.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, reservations });
}