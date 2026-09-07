// src/lib/reservation/month-range.ts
//
// BUSINESS RULE: daily reservations are restricted to the CURRENT Jalali
// month only (parent cannot use "daily" mode to book into next month —
// that's what "monthly" mode, restricted to NEXT month onward, is for).
//
// Returns the first and last Gregorian date of the current Jalali month,
// for use as bounds when validating/filtering selectable days.

import { gregorianToJalali, jalaliToGregorian, jalaliMonthLength } from "@/lib/date/jalali";
import { toDateOnly } from "@/lib/date/normalize";

export function getCurrentJalaliMonthRange(now: Date): {
    start: Date;
    end: Date;
} {
    const { jy, jm } = gregorianToJalali(now);
    const start = jalaliToGregorian(jy, jm, 1);
    const lastDay = jalaliMonthLength(jy, jm);
    const end = jalaliToGregorian(jy, jm, lastDay);
    return { start: toDateOnly(start), end: toDateOnly(end) };
}

export function isWithinCurrentJalaliMonth(date: Date, now: Date): boolean {
    const { start, end } = getCurrentJalaliMonthRange(now);
    const normalized = toDateOnly(date);
    return (
        normalized.getTime() >= start.getTime() &&
        normalized.getTime() <= end.getTime()
    );
}