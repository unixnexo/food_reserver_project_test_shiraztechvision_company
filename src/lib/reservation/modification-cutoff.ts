// src/lib/reservation/modification-cutoff.ts
//
// Whether an ALREADY-PLACED reservation for a given date can still be
// cancelled or edited by the parent. Reuses the exact same cutoff rule as
// new bookings (lib/reservation/cutoff.ts: today is always locked in,
// tomorrow is locked in once it's past 5pm Iran time) — the kitchen needs
// the same lead time to adjust prep whether a meal is being added or
// removed/changed.
//
// Deliberately does NOT reuse isDateSelectableForDailyReservation, since
// that also applies the current-month-only and school-day rules, which
// are booking-time constraints on which NEW dates can be picked — they
// don't apply to modifying a reservation that already exists for a date
// (that date was necessarily valid when the order was first placed).

import { isDateBookable } from "./cutoff";

export function canModifyReservationForDate(date: Date, now: Date): boolean {
    return isDateBookable(date, now);
}