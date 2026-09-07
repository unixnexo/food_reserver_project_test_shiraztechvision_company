// src/app/api/children/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// POST creates a new Child record linked to the currently logged-in
// parent (identified via the session cookie — see lib/auth/session.ts).
// GET returns all children belonging to the logged-in parent (used by the
// dashboard to list registered children).
//
// AUTH: requires a valid PARENT (or ADMIN) session. Returns 401 if not
// logged in.
//
// POST REQUEST BODY (JSON):
//   {
//     "firstName": string,
//     "lastName": string,
//     "birthDate": string,       // ISO date string, e.g. "2015-03-21"
//     "nationalCode": string,    // 10 digits, validated via checksum
//     "gender": "MALE" | "FEMALE",
//     "gradeId": string,         // Grade.id
//     "schoolId": string         // School.id
//   }
//
// POST RESPONSE (201):
//   { "success": true, "child": { id, firstName, lastName, ... } }
//
// POST RESPONSE (400) — validation error:
//   { "success": false, "error": "<Persian message>" }
//
// POST RESPONSE (409) — national code already registered:
//   { "success": false, "error": "این کد ملی قبلا ثبت شده است" }
//
// GET RESPONSE (200):
//   { "success": true, "children": [{ id, firstName, lastName, grade: {...}, school: {...} }, ...] }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { createChildSchema } from "@/lib/validations/child";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { success: false, error: "ابتدا وارد شوید" },
            { status: 401 }
        );
    }

    const body = await request.json().catch(() => null);
    const parsed = createChildSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    try {
        const child = await prisma.child.create({
            data: {
                ...parsed.data,
                parentId: session.userId,
            },
        });

        return NextResponse.json({ success: true, child }, { status: 201 });
    } catch (error) {
        // P2002 = unique constraint violation (nationalCode is @unique)
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                { success: false, error: "این کد ملی قبلا ثبت شده است" },
                { status: 409 }
            );
        }
        throw error;
    }
}

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { success: false, error: "ابتدا وارد شوید" },
            { status: 401 }
        );
    }

    const children = await prisma.child.findMany({
        where: { parentId: session.userId },
        include: { grade: true, school: true },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, children });
}