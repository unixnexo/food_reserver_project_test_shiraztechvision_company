// src/app/api/admin/menu-items/[id]/route.ts
//
// PAGE/ROUTE PURPOSE:
// Removes a single food from a specific menu day. ADMIN-only.
//
// DELETE RESPONSE (200):
//   { "success": true }
//
// DELETE RESPONSE (409) — at least one parent has already ordered this
// meal for this day (OrderItem rows reference it), removal blocked to
// protect existing paid reservations:
//   { "success": false, "error": "این غذا قبلا توسط والدین رزرو شده و قابل حذف نیست" }
//
// DELETE RESPONSE (404):
//   { "success": false, "error": "آیتم منو یافت نشد" }

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

    const menuItem = await prisma.menuItem.findUnique({ where: { id } });
    if (!menuItem) {
        return NextResponse.json(
            { success: false, error: "آیتم منو یافت نشد" },
            { status: 404 }
        );
    }

    const orderCount = await prisma.orderItem.count({
        where: { menuItemId: id },
    });

    if (orderCount > 0) {
        return NextResponse.json(
            {
                success: false,
                error: "این غذا قبلا توسط والدین رزرو شده و قابل حذف نیست",
            },
            { status: 409 }
        );
    }

    await prisma.menuItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
}