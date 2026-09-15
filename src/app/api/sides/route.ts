// src/app/api/sides/route.ts
//
// PAGE/ROUTE PURPOSE:
// Returns the full list of sides/toppings for the reservation flow's
// optional side picker. Public within the app (any logged-in user can
// read this — it's reference data, not sensitive), same pattern as
// /api/schools.
//
// RESPONSE (200):
//   { "success": true, "sides": [{ "id": string, "name": string }, ...] }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const sides = await prisma.side.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
    });

    return NextResponse.json({ success: true, sides });
}