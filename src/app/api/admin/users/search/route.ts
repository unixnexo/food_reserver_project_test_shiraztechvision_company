// src/app/api/admin/users/search/route.ts
//
// PAGE/ROUTE PURPOSE:
// Look up a parent by phone number for the admin wallet page. Returns
// wallet balance and the parent's children (for display context — admins
// don't have parent names to search by, only phone). ADMIN-only.
//
// GET /api/admin/users/search?phone=0912...
// RESPONSE (200):
//   { "success": true, "user": { "id", "phone", "walletBalance", "children": [{ "id", "firstName", "lastName" }] } }
// RESPONSE (404):
//   { "success": false, "error": "کاربری با این شماره یافت نشد" }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.trim();

    if (!phone) {
        return NextResponse.json(
            { success: false, error: "شماره موبایل الزامی است" },
            { status: 400 }
        );
    }

    const user = await prisma.user.findUnique({
        where: { phone },
        select: {
            id: true,
            phone: true,
            walletBalance: true,
            children: {
                select: { id: true, firstName: true, lastName: true },
            },
        },
    });

    if (!user) {
        return NextResponse.json(
            { success: false, error: "کاربری با این شماره یافت نشد" },
            { status: 404 }
        );
    }

    return NextResponse.json({ success: true, user });
}