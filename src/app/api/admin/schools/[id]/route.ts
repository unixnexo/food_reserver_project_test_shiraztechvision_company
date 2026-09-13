// src/app/api/admin/schools/[id]/route.ts
//
// PAGE/ROUTE PURPOSE:
// Rename or delete a single school. ADMIN-only.
//
// PATCH REQUEST BODY (JSON):
//   { "name": string }
// PATCH RESPONSE (200):
//   { "success": true, "school": { "id": string, "name": string } }
// PATCH RESPONSE (409) — duplicate school name:
//   { "success": false, "error": "این مدرسه قبلا ثبت شده است" }
//
// DELETE RESPONSE (200):
//   { "success": true }
// DELETE RESPONSE (409) — school is referenced by at least one Child,
// deletion blocked to protect historical registration/order data:
//   { "success": false, "error": "این مدرسه دارای دانش‌آموز ثبت‌شده است و قابل حذف نیست" }
// DELETE RESPONSE (404):
//   { "success": false, "error": "مدرسه یافت نشد" }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { updateSchoolSchema } from "@/lib/validations/school";
import { Prisma } from "@prisma/client";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    const body = await request.json().catch(() => null);
    const parsed = updateSchoolSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) {
        return NextResponse.json(
            { success: false, error: "مدرسه یافت نشد" },
            { status: 404 }
        );
    }

    try {
        const updated = await prisma.school.update({
            where: { id },
            data: parsed.data,
        });
        return NextResponse.json({ success: true, school: updated });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { success: false, error: "این مدرسه قبلا ثبت شده است" },
                { status: 409 }
            );
        }
        throw error;
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) {
        return NextResponse.json(
            { success: false, error: "مدرسه یافت نشد" },
            { status: 404 }
        );
    }

    const usageCount = await prisma.child.count({ where: { schoolId: id } });
    if (usageCount > 0) {
        return NextResponse.json(
            {
                success: false,
                error: "این مدرسه دارای دانش‌آموز ثبت‌شده است و قابل حذف نیست",
            },
            { status: 409 }
        );
    }

    await prisma.school.delete({ where: { id } });

    return NextResponse.json({ success: true });
}