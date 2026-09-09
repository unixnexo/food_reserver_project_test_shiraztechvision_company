// src/lib/date/normalize.ts
//
// Many models (MenuItem, ClosedDay, OrderItem) store a "calendar day" with
// no meaningful time component. To make equality/range queries reliable
// regardless of what time-of-day a Date object happens to carry, we always
// normalize to midnight UTC before writing or querying by date.

export function toDateOnly(date: Date): Date {
    return new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
}


/**
 * Formats a local Date as a YYYY-MM-DD string using LOCAL getters
 * (not toISOString/UTC). Use this whenever converting a Date the user
 * picked in the UI (e.g. from a calendar) into a date param for the API —
 * toISOString() shifts the date backward for any timezone ahead of UTC
 * (e.g. Iran, UTC+3:30), which silently off-by-ones every date-dependent
 * check (availability, closed days, menu lookup, etc).
 */
export function toDateParam(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}