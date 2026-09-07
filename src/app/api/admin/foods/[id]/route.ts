// src/app/api/admin/foods/[id]/route.ts
//
// PAGE/ROUTE PURPOSE:
// Delete a single food from the food bank. ADMIN-only.
//
// DELETE RESPONSE (200):
//   { "success": true }
//
// DELETE RESPONSE (409) — food is referenced by at least one MenuItem
// (past or future), deletion blocked to protect historical order data:
//   { "success": false, "error": "این غذا در منو استفاده شده و قابل حذف نیست" }
//
// DELETE RESPONSE (404):
//   { "success": false, "error": "غذا یافت نشد" }

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

    const food = await prisma.food.findUnique({ where: { id } });
    if (!food) {
        return NextResponse.json(
            { success: false, error: "غذا یافت نشد" },
            { status: 404 }
        );
    }

    const usageCount = await prisma.menuItem.count({ where: { foodId: id } });
    if (usageCount > 0) {
        return NextResponse.json(
            {
                success: false,
                error: "این غذا در منو استفاده شده و قابل حذف نیست",
            },
            { status: 409 }
        );
    }

    await prisma.food.delete({ where: { id } });

    return NextResponse.json({ success: true });
}