// src/app/api/admin/portion-pricing/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Manages the single global pricing row for نیم پرس / تمام پرس (both in
// تومن, whole numbers). ADMIN-only.
//
// IMPORTANT: this is the LIVE price only. When a parent places an order,
// the current price here is copied ("snapshotted") onto each OrderItem —
// changing prices here never retroactively affects past orders or reports.
//
// GET RESPONSE (200):
//   { "success": true, "pricing": { "id", "halfPortionPrice", "fullPortionPrice" } }
//
// PUT REQUEST BODY (JSON):
//   { "halfPortionPrice": number, "fullPortionPrice": number }
// PUT RESPONSE (200):
//   { "success": true, "pricing": { ... } }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { updatePortionPricingSchema } from "@/lib/validations/portion-pricing";

export async function GET() {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const pricing = await prisma.portionPricing.findFirst();

    return NextResponse.json({ success: true, pricing });
}

export async function PUT(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const body = await request.json().catch(() => null);
    const parsed = updatePortionPricingSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const existing = await prisma.portionPricing.findFirst();

    const pricing = existing
        ? await prisma.portionPricing.update({
            where: { id: existing.id },
            data: parsed.data,
        })
        : await prisma.portionPricing.create({ data: parsed.data });

    return NextResponse.json({ success: true, pricing });
}