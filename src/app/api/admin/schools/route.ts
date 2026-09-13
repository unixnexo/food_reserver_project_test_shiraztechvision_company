// src/app/api/admin/schools/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// School management (CRUD). Previously schools were seed-only; admin can
// now create/rename/delete them. ADMIN-only.
//
// GET RESPONSE (200):
//   { "success": true, "schools": [{ "id": string, "name": string }, ...] }
//
// POST REQUEST BODY (JSON):
//   { "name": string }
//
// POST RESPONSE (201):
//   { "success": true, "school": { "id": string, "name": string } }
//
// POST RESPONSE (409) — duplicate school name:
//   { "success": false, "error": "این مدرسه قبلا ثبت شده است" }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSchoolSchema } from "@/lib/validations/school";
import { Prisma } from "@prisma/client";

export async function GET() {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const schools = await prisma.school.findMany({
        orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, schools });
}

export async function POST(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const body = await request.json().catch(() => null);
    const parsed = createSchoolSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    try {
        const school = await prisma.school.create({ data: parsed.data });
        return NextResponse.json({ success: true, school }, { status: 201 });
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