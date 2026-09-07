// src/app/api/admin/closed-days/[id]/route.ts
//
// PAGE/ROUTE PURPOSE:
// Removes a closed-day override, reopening that date as a normal school
// day. ADMIN-only. Safe to allow unconditionally: a closed date should
// never have MenuItem/OrderItem rows against it (admin has no way to
// assign a menu to a day that isn't open), so there's no historical data
// to protect here — unlike food/menu-item deletion.
//
// DELETE RESPONSE (200):
//   { "success": true }
// DELETE RESPONSE (404):
//   { "success": false, "error": "روز تعطیل یافت نشد" }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    const closedDay = await prisma.closedDay.findUnique({ where: { id } });
    if (!closedDay) {
        return NextResponse.json(
            { success: false, error: "روز تعطیل یافت نشد" },
            { status: 404 }
        );
    }

    await prisma.closedDay.delete({ where: { id } });

    return NextResponse.json({ success: true });
}