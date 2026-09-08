// GET /api/admin/menu-items/summary?year=2025&month=6
// Returns per-day food counts for the given Gregorian month, so the
// admin calendar can show "3 foods" under each day without fetching
// every day individually.
//
// RESPONSE (200):
//   { "success": true, "counts": { "2025-06-01": 3, "2025-06-04": 2, ... } }
//   (days with zero menu items are omitted)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const { searchParams } = new URL(request.url);
    const year = Number(searchParams.get("year"));
    const month = Number(searchParams.get("month")); // 1-12

    if (!year || !month || month < 1 || month > 12) {
        return NextResponse.json(
            { success: false, error: "پارامترهای نامعتبر" },
            { status: 400 }
        );
    }

    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const menuItems = await prisma.menuItem.findMany({
        where: {
            date: { gte: start, lt: end },
        },
        select: { date: true },
    });

    const counts: Record<string, number> = {};

    for (const item of menuItems) {
        const key = item.date.toISOString().split("T")[0];
        counts[key] = (counts[key] ?? 0) + 1;
    }

    return NextResponse.json({ success: true, counts });
}