// src/app/api/admin/kitchen-report/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Printable kitchen prep list for ONE school on ONE day — what the
// kitchen actually needs: which child gets which portion size, any
// per-meal note (allergies/preferences), sorted by grade then name.
// ADMIN-only.
//
// Deliberately scoped to a single school + single date (not a general
// filterable report like /api/admin/reports) because that's how a kitchen
// consumes this: one school's kitchen prints one day's list. Only ACTIVE
// items on PAID orders are included — a cancelled or unpaid reservation
// isn't food the kitchen needs to prepare.
//
// GET /api/admin/kitchen-report?schoolId=...&date=YYYY-MM-DD
// RESPONSE (200):
//   {
//     "success": true,
//     "schoolName": string,
//     "date": string,                 // ISO date, echoed back
//     "rows": [
//       { "childName": string, "gradeName": string, "portionType": "HALF" | "FULL", "note": string | null }
//     ],
//     "totals": { "half": number, "full": number }
//   }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { kitchenReportFilterSchema } from "@/lib/validations/kitchen-report";
import { toDateOnly } from "@/lib/date/normalize";

export async function GET(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const { searchParams } = new URL(request.url);
    const parsed = kitchenReportFilterSchema.safeParse({
        schoolId: searchParams.get("schoolId") ?? undefined,
        date: searchParams.get("date") ?? undefined,
    });

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const school = await prisma.school.findUnique({
        where: { id: parsed.data.schoolId },
    });

    if (!school) {
        return NextResponse.json(
            { success: false, error: "مدرسه یافت نشد" },
            { status: 404 }
        );
    }

    const date = toDateOnly(parsed.data.date);

    const items = await prisma.orderItem.findMany({
        where: {
            date,
            status: "ACTIVE",
            order: { status: "PAID" },
            child: { schoolId: parsed.data.schoolId },
        },
        include: {
            child: { include: { grade: true } },
            sides: { include: { side: true } },
        },
        orderBy: [
            { child: { grade: { order: "asc" } } },
            { child: { firstName: "asc" } },
        ],
    });

    const rows = items.map((item) => {
        const sideNames = item.sides.map((s) => s.side.name);
        const noteParts = [
            ...(sideNames.length > 0 ? [`ضمیمه: ${sideNames.join("، ")}`] : []),
            ...(item.note ? [item.note] : []),
        ];

        return {
            childName: `${item.child.firstName} ${item.child.lastName}`,
            gradeName: item.child.grade.name,
            portionType: item.portionType,
            note: noteParts.length > 0 ? noteParts.join(" — ") : null,
        };
    });

    const totals = {
        half: rows.filter((r) => r.portionType === "HALF").length,
        full: rows.filter((r) => r.portionType === "FULL").length,
    };

    return NextResponse.json({
        success: true,
        schoolName: school.name,
        date: date.toISOString().split("T")[0],
        rows,
        totals,
    });
}