// src/app/api/admin/wallet/transactions/route.ts
//
// PAGE/ROUTE PURPOSE:
// Paginated wallet transaction history for a single user, shown on the
// admin wallet page after searching for a parent. ADMIN-only.
//
// GET /api/admin/wallet/transactions?userId=...&page=1&pageSize=20
// RESPONSE (200):
//   { "success": true, "transactions": [...], "pagination": {...} }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json(
            { success: false, error: "کاربر الزامی است" },
            { status: 400 }
        );
    }

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const pageSize = Math.min(
        Math.max(Number(searchParams.get("pageSize")) || 20, 1),
        100
    );

    const [totalCount, transactions] = await Promise.all([
        prisma.walletTransaction.count({ where: { userId } }),
        prisma.walletTransaction.findMany({
            where: { userId },
            include: { admin: { select: { phone: true } } },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
    ]);

    return NextResponse.json({
        success: true,
        transactions,
        pagination: {
            page,
            pageSize,
            totalCount,
            totalPages: Math.max(Math.ceil(totalCount / pageSize), 1),
        },
    });
}