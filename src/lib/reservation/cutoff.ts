// src/lib/reservation/cutoff.ts
//
// BUSINESS RULE (daily reservations):
// - Today is never bookable.
// - Tomorrow is bookable UNLESS the current time is at or past 5:00 PM
//   today — in which case tomorrow is also blocked, and the earliest
//   bookable day becomes the day after tomorrow.
// - Everything from the earliest bookable day onward is bookable, subject
//   to separate school-day rules (Thu/Fri/closed days) and the
//   current-month-only restriction for daily reservations.
//
// This is a pure function of `now` — no DB access — so it's fully unit
// testable without mocking anything.

import { toDateOnly } from "@/lib/date/normalize";

const CUTOFF_HOUR = 17; // 5:00 PM, 24h clock

/**
 * Returns the earliest calendar date (midnight UTC) that can be booked,
 * given the current moment `now`.
 */
export function getEarliestBookableDate(now: Date): Date {
    const today = toDateOnly(now);
    const tomorrow = addDays(today, 1);
    const dayAfterTomorrow = addDays(today, 2);

    const isPastCutoff = now.getHours() >= CUTOFF_HOUR;

    return isPastCutoff ? dayAfterTomorrow : tomorrow;
}

/** Whether a given calendar date is on or after the earliest bookable date. */
export function isDateBookable(date: Date, now: Date): boolean {
    const normalized = toDateOnly(date);
    const earliest = getEarliestBookableDate(now);
    return normalized.getTime() >= earliest.getTime();
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
}