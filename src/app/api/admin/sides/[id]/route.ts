// src/app/api/admin/sides/[id]/route.ts
//
// PAGE/ROUTE PURPOSE:
// Delete a single side/topping from the side bank. ADMIN-only.
//
// DELETE RESPONSE (200): { "success": true }
// DELETE RESPONSE (409) — side is attached to at least one OrderItem
// (past or future), deletion blocked to protect historical order data:
//   { "success": false, "error": "این آیتم در سفارش‌ها استفاده شده و قابل حذف نیست" }
// DELETE RESPONSE (404): { "success": false, "error": "آیتم یافت نشد" }

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

    const side = await prisma.side.findUnique({ where: { id } });
    if (!side) {
        return NextResponse.json(
            { success: false, error: "آیتم یافت نشد" },
            { status: 404 }
        );
    }

    const usageCount = await prisma.orderItemSide.count({ where: { sideId: id } });
    if (usageCount > 0) {
        return NextResponse.json(
            {
                success: false,
                error: "این آیتم در سفارش‌ها استفاده شده و قابل حذف نیست",
            },
            { status: 409 }
        );
    }

    await prisma.side.delete({ where: { id } });

    return NextResponse.json({ success: true });
}