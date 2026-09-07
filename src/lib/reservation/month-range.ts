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

/**
 * Returns the first and last Gregorian date of the NEXT Jalali month
 * (relative to `now`). Used to restrict monthly reservations — per
 * product decision, monthly reservation is available ONLY for the
 * immediately upcoming Jalali month, never the current month or months
 * further out.
 */
export function getNextJalaliMonthRange(now: Date): {
    start: Date;
    end: Date;
} {
    const { jy, jm } = gregorianToJalali(now);
    const nextJm = jm === 12 ? 1 : jm + 1;
    const nextJy = jm === 12 ? jy + 1 : jy;
    const start = jalaliToGregorian(nextJy, nextJm, 1);
    const lastDay = jalaliMonthLength(nextJy, nextJm);
    const end = jalaliToGregorian(nextJy, nextJm, lastDay);
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

/** Whether a date falls within NEXT Jalali month (the only month monthly reservation allows). */
export function isWithinNextJalaliMonth(date: Date, now: Date): boolean {
    const { start, end } = getNextJalaliMonthRange(now);
    const normalized = toDateOnly(date);
    return (
        normalized.getTime() >= start.getTime() &&
        normalized.getTime() <= end.getTime()
    );
}