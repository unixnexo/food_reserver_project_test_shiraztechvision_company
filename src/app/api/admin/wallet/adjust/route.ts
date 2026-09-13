// src/app/api/admin/wallet/adjust/route.ts
//
// PAGE/ROUTE PURPOSE:
// Admin manually adds or deducts money from a parent's wallet, with an
// optional توضیحات note. ADMIN-only. Sends an SMS to the affected user
// telling them their new balance.
//
// POST REQUEST BODY (JSON):
//   { "userId": string, "type": "CREDIT" | "DEBIT", "amount": number, "note"?: string }
//
// RESPONSE (200):
//   { "success": true, "newBalance": number }
// RESPONSE (400) — validation error or insufficient balance for a DEBIT:
//   { "success": false, "error": string }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adjustWalletSchema } from "@/lib/validations/wallet";
import { adjustWallet } from "@/lib/wallet/adjust-wallet";
import { getSmsSender } from "@/lib/sms/sms-sender";
import { walletAdjustedMessage } from "@/lib/sms/templates";

export async function POST(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const body = await request.json().catch(() => null);
    const parsed = adjustWalletSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const { userId, type, amount, note } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return NextResponse.json(
            { success: false, error: "کاربر یافت نشد" },
            { status: 404 }
        );
    }

    const result = await adjustWallet({
        userId,
        type,
        reason: "ADMIN_ADJUSTMENT",
        amount,
        note: note ?? null,
        adminId: admin.userId,
    });

    if (!result.ok) {
        return NextResponse.json(
            { success: false, error: result.error },
            { status: 400 }
        );
    }

    await getSmsSender().send(
        user.phone,
        walletAdjustedMessage({
            type,
            amount,
            newBalance: result.newBalance,
        })
    );

    return NextResponse.json({ success: true, newBalance: result.newBalance });
}