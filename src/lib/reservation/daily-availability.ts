// src/lib/reservation/daily-availability.ts
//
// Combines all THREE rules that determine whether a date can be selected
// in the DAILY reservation flow:
//   1. Cutoff rule (lib/reservation/cutoff.ts) — today blocked, tomorrow
//      blocked if past 5pm
//   2. Current-month-only restriction (lib/reservation/month-range.ts)
//   3. School-day rule (lib/school-calendar/is-school-day.ts) — Thu/Fri +
//      admin-defined closures
//
// This is the single source of truth the API route validates against on
// the server (never trust the client's date selection) and that the UI
// uses to gray out unselectable days on the calendar.

import { isDateBookable } from "./cutoff";
import { isWithinCurrentJalaliMonth } from "./month-range";
import { isSchoolDaySync } from "@/lib/school-calendar/is-school-day";

export function isDateSelectableForDailyReservation(
    date: Date,
    now: Date,
    closedDates: Set<string>
): boolean {
    return (
        isDateBookable(date, now) &&
        isWithinCurrentJalaliMonth(date, now) &&
        isSchoolDaySync(date, closedDates)
    );
}