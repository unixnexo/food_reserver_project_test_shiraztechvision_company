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