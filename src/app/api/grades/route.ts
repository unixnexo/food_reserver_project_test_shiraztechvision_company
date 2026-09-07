// src/app/api/grades/route.ts
//
// PAGE/ROUTE PURPOSE:
// Returns the full list of grades (پایه تحصیلی) for populating the
// registration form's grade dropdown, ordered by grade level (1-12) via
// the `order` field — not alphabetically, since Persian grade names don't
// sort correctly as strings.
//
// RESPONSE (200):
//   { "success": true, "grades": [{ "id": string, "name": string, "order": number }, ...] }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const grades = await prisma.grade.findMany({
        orderBy: { order: "asc" },
        select: { id: true, name: true, order: true },
    });

    return NextResponse.json({ success: true, grades });
}