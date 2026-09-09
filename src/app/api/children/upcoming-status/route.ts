// src/app/api/children/upcoming-status/route.ts
//
// Returns, for every child of the logged-in parent, whether they have a
// food reservation for today/tomorrow/day-after-tomorrow (school days
// only — off days are excluded from the equation entirely). Used by the
// parent dashboard to render a quick per-child status and flag urgency.
//
// GET RESPONSE (200):
//   {
//     "success": true,
//     "statuses": {
//       "<childId>": {
//         "days": [{ "date": "YYYY-MM-DD", "hasReservation": boolean }, ...],
//         "needsAction": boolean
//       },
//       ...
//     }
//   }

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getChildrenUpcomingStatus } from "@/lib/reservation/upcoming-status";

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
        select: { id: true },
    });

    const statusMap = await getChildrenUpcomingStatus(
        children.map((c) => c.id)
    );

    const statuses: Record<
        string,
        {
            days: {
                date: string;
                hasReservation: boolean;
                foodName: string | null;
                portionType: "HALF" | "FULL" | null;
            }[];
            needsAction: boolean;
        }
    > = {};

    for (const [childId, status] of statusMap) {
        statuses[childId] = { days: status.days, needsAction: status.needsAction };
    }

    return NextResponse.json({ success: true, statuses });
}