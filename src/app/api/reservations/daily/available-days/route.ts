// src/app/api/reservations/daily/available-days/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Returns everything the daily-reservation UI needs to render the current
// month's calendar: which dates are selectable, and (for convenience) the
// full current-month range. Requires a logged-in PARENT/ADMIN session.
//
// GET RESPONSE (200):
//   {
//     "success": true,
//     "monthRange": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
//     "selectableDates": ["YYYY-MM-DD", ...]
//   }
//
// NOTE: this does NOT return menu/food data per day — that's a separate
// call (GET /api/reservations/menu?date=...) made once the parent has
// picked specific dates, to avoid over-fetching every day's full menu
// upfront.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getCurrentJalaliMonthRange } from "@/lib/reservation/month-range";
import { isDateSelectableForDailyReservation } from "@/lib/reservation/daily-availability";
import { getClosedDatesInRange } from "@/lib/school-calendar/is-school-day";
import { toDateParam } from "@/lib/date/normalize";


export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { success: false, error: "ابتدا وارد شوید" },
            { status: 401 }
        );
    }

    const now = new Date();
    const { start, end } = getCurrentJalaliMonthRange(now);
    const closedDates = await getClosedDatesInRange(start, end);

    const selectableDates: string[] = [];
    const offDates: string[] = [];
    const cursor = new Date(start);

    while (cursor.getTime() <= end.getTime()) {
        const dayOfWeek = cursor.getUTCDay();
        const dateParam = toDateParam(cursor);

        if (isDateSelectableForDailyReservation(cursor, now, closedDates)) {
            selectableDates.push(dateParam);
        }

        const isClosed = closedDates.has(dateParam);

        if (dayOfWeek === 4 || dayOfWeek === 5 || isClosed) {
            offDates.push(dateParam);
        }

        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return NextResponse.json({
        success: true,
        monthRange: { start: toDateParam(start), end: toDateParam(end) },
        selectableDates,
        offDates,
    });
}
