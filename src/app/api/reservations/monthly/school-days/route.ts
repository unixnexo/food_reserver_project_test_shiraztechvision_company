// src/app/api/reservations/monthly/school-days/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Returns every school day in NEXT Jalali month — the monthly reservation
// flow has no manual day-picking (unlike daily); every school day in that
// one fixed month is automatically included. Requires a logged-in session.
//
// GET RESPONSE (200):
//   {
//     "success": true,
//     "monthRange": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
//     "schoolDays": ["YYYY-MM-DD", ...]
//   }

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getNextJalaliMonthRange } from "@/lib/reservation/month-range";
import {
    getSchoolDaysInRange,
    getClosedDatesInRange,
} from "@/lib/school-calendar/is-school-day";

function toDateParam(date: Date): string {
    return date.toISOString().split("T")[0];
}

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { success: false, error: "ابتدا وارد شوید" },
            { status: 401 }
        );
    }

    const now = new Date();
    const { start, end } = getNextJalaliMonthRange(now);
    const closedDates = await getClosedDatesInRange(start, end);
    const schoolDays = getSchoolDaysInRange(start, end, closedDates);

    return NextResponse.json({
        success: true,
        monthRange: { start: toDateParam(start), end: toDateParam(end) },
        schoolDays: schoolDays.map(toDateParam),
    });
}