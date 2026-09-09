// src/lib/reservation/cutoff.ts
//
// BUSINESS RULE (daily reservations):
// - Today is never bookable.
// - Tomorrow is bookable UNLESS the current time is at or past 5:00 PM
//   IRAN TIME today — in which case tomorrow is also blocked, and the
//   earliest bookable day becomes the day after tomorrow.
// - Everything from the earliest bookable day onward is bookable, subject
//   to separate school-day rules (Thu/Fri/closed days) and the
//   current-month-only restriction for daily reservations.
//
// TIMEZONE NOTE: the 5pm cutoff is a business rule about Iran local time,
// not server local time. The server (Plesk host) may run in UTC or any
// other zone, so we must NOT use `now.getHours()` (server-local) here —
// that silently changes the effective cutoff depending on server config.
// Iran (Asia/Tehran) is UTC+3:30 with no DST, so we resolve the hour via
// Intl.DateTimeFormat rather than hardcoding an offset (safer if that ever
// changes, and self-documenting).
//
// This is a pure function of `now` — no DB access — so it's fully unit
// testable without mocking anything, and independent of process.env.TZ.

import { toDateOnly } from "@/lib/date/normalize";

const CUTOFF_HOUR = 17; // 5:00 PM, 24h clock, Iran local time
const IRAN_TIME_ZONE = "Asia/Tehran";

const iranHourFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: IRAN_TIME_ZONE,
    hour: "numeric",
    hour12: false,
});

/** Returns the 0-23 hour of `now` as it would read on a clock in Iran. */
function getIranHour(now: Date): number {
    // hour12: false can format midnight as "24" in some environments —
    // normalize that back to 0 so comparisons behave as expected.
    const hour = Number(iranHourFormatter.format(now));
    return hour === 24 ? 0 : hour;
}

/**
 * Returns the earliest calendar date (midnight UTC) that can be booked,
 * given the current moment `now`.
 */
export function getEarliestBookableDate(now: Date): Date {
    const today = toDateOnly(now);
    const tomorrow = addDays(today, 1);
    const dayAfterTomorrow = addDays(today, 2);

    const isPastCutoff = getIranHour(now) >= CUTOFF_HOUR;

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
