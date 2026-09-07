// src/app/api/reservations/menu/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Returns the foods available on a specific date (for the parent to
// choose from), plus the current portion pricing (needed to display
// prices per option before the parent commits). Requires a logged-in
// session (any role).
//
// GET QUERY PARAM:
//   ?date=YYYY-MM-DD
//
// GET RESPONSE (200):
//   {
//     "success": true,
//     "menuItems": [{ "id": string, "food": { "id", "name" } }, ...],
//     "pricing": { "halfPortionPrice": number, "fullPortionPrice": number }
//   }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { toDateOnly } from "@/lib/date/normalize";

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { success: false, error: "ابتدا وارد شوید" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
        return NextResponse.json(
            { success: false, error: "پارامتر تاریخ الزامی است" },
            { status: 400 }
        );
    }

    const date = toDateOnly(new Date(dateParam));

    const [menuItems, pricing] = await Promise.all([
        prisma.menuItem.findMany({
            where: { date },
            include: { food: true },
        }),
        prisma.portionPricing.findFirst(),
    ]);

    return NextResponse.json({ success: true, menuItems, pricing });
}