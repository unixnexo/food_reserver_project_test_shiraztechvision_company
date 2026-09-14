// src/app/api/reservations/edit/options/route.ts
//
// PAGE/ROUTE PURPOSE:
// Returns the food choices available for the SAME DATE as an existing
// reservation, for the "change food" edit UI. Scoped by orderItemId
// (rather than taking a date directly) so the client doesn't need to
// re-derive/trust the date itself — it's read straight from the
// reservation being edited, and ownership is checked here too.
//
// GET /api/reservations/edit/options?orderItemId=...
// RESPONSE (200):
//   { "success": true, "currentMenuItemId": string, "options": [{ "id", "food": { "id", "name" } }] }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { success: false, error: "ابتدا وارد شوید" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const orderItemId = searchParams.get("orderItemId");

    if (!orderItemId) {
        return NextResponse.json(
            { success: false, error: "شناسه سفارش الزامی است" },
            { status: 400 }
        );
    }

    const item = await prisma.orderItem.findUnique({
        where: { id: orderItemId },
        include: { order: true },
    });

    if (!item || item.order.userId !== session.userId) {
        return NextResponse.json(
            { success: false, error: "سفارش یافت نشد" },
            { status: 404 }
        );
    }

    const options = await prisma.menuItem.findMany({
        where: { date: item.date },
        include: { food: true },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
        success: true,
        currentMenuItemId: item.menuItemId,
        options: options.map((o) => ({ id: o.id, food: { id: o.food.id, name: o.food.name } })),
    });
}