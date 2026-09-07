// src/lib/school-calendar/is-school-day.ts
//
// SINGLE SOURCE OF TRUTH for "is this date a school day" — used by:
// - Admin closed-day management (prevent redundant closures, list overrides)
// - Parent reservation flow (Step 6/7) — filters which dates are selectable
//
// RULE:
// 1. Thursdays and Fridays are closed by default (JS Date.getUTCDay(): 4 = Thu, 5 = Fri)
// 2. Any additional date found in the ClosedDay table is also closed
//    (exceptions-only table — see schema.prisma comment on ClosedDay)
// 3. Everything else is open
//
// Admin can only ADD closures beyond the Thu/Fri default — there is no
// mechanism to "reopen" a default-closed Thursday/Friday (per product
// decision). This function reflects that: it never needs to check for a
// "reopen" override because none can exist.

import { prisma } from "@/lib/prisma";
import { toDateOnly } from "@/lib/date/normalize";

const THURSDAY = 4;
const FRIDAY = 5;

function isWeekendByDefault(date: Date): boolean {
    const day = date.getUTCDay();
    return day === THURSDAY || day === FRIDAY;
}

/** Checks a single date. Hits the DB once — prefer getClosedDatesInRange for bulk checks. */
export async function isSchoolDay(date: Date): Promise<boolean> {
    const normalized = toDateOnly(date);

    if (isWeekendByDefault(normalized)) return false;

    const closedDay = await prisma.closedDay.findUnique({
        where: { date: normalized },
    });

    return !closedDay;
}

/**
 * Returns the set of ClosedDay dates (as "YYYY-MM-DD" strings) within a
 * range, for efficient bulk school-day filtering (e.g. rendering a whole
 * month's calendar) without one DB round-trip per day.
 */
export async function getClosedDatesInRange(
    start: Date,
    end: Date
): Promise<Set<string>> {
    const closedDays = await prisma.closedDay.findMany({
        where: {
            date: { gte: toDateOnly(start), lte: toDateOnly(end) },
        },
        select: { date: true },
    });

    return new Set(closedDays.map((c) => c.date.toISOString().split("T")[0]));
}

/** Pure function version for bulk use once you already have the closed-dates set. */
export function isSchoolDaySync(
    date: Date,
    closedDates: Set<string>
): boolean {
    const normalized = toDateOnly(date);
    if (isWeekendByDefault(normalized)) return false;
    return !closedDates.has(normalized.toISOString().split("T")[0]);
}