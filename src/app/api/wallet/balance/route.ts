// src/app/api/wallet/balance/route.ts
//
// PAGE/ROUTE PURPOSE:
// Returns the logged-in user's own wallet balance. Used by the reservation
// flow to show the balance and decide whether "pay with wallet" should be
// enabled (insufficient balance -> disabled, not hidden, so the user
// understands the option exists but can't afford it right now).
//
// RESPONSE (200):
//   { "success": true, "balance": number }

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

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { walletBalance: true },
    });

    if (!user) {
        return NextResponse.json(
            { success: false, error: "کاربر یافت نشد" },
            { status: 404 }
        );
    }

    return NextResponse.json({ success: true, balance: user.walletBalance });
}