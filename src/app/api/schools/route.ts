// src/app/api/schools/route.ts
//
// PAGE/ROUTE PURPOSE:
// Returns the full list of schools for populating the registration form's
// school dropdown. Public within the app (any logged-in user can read
// this — it's reference data, not sensitive).
//
// RESPONSE (200):
//   { "success": true, "schools": [{ "id": string, "name": string }, ...] }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const schools = await prisma.school.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
    });

    return NextResponse.json({ success: true, schools });
}