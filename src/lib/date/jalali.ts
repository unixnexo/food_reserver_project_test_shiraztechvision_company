// src/lib/date/jalali.ts
//
// Thin wrapper around jalaali-js for converting between Jalali (Persian)
// calendar dates used in the UI and Gregorian dates stored in the DB.
//
// We always store/transmit Gregorian dates (see schema.prisma comment on
// Child.birthDate) — conversion happens only at the UI boundary.

// import jalaali from "jalaali-js";
import * as jalaali from "jalaali-js";

export const PERSIAN_MONTH_NAMES = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
];

/** Converts a Jalali (jy, jm, jd) date to a Gregorian JS Date. */
export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
    return new Date(Date.UTC(gy, gm - 1, gd));
}

/** Converts a Gregorian JS Date to Jalali (jy, jm, jd) parts. */
export function gregorianToJalali(date: Date) {
    const { jy, jm, jd } = jalaali.toJalaali(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate()
    );
    return { jy, jm, jd };
}

/** Number of days in a given Jalali month (accounts for leap years). */
export function jalaliMonthLength(jy: number, jm: number): number {
    return jalaali.jalaaliMonthLength(jy, jm);
}

/** Returns a reasonable range of Jalali years for a birthdate picker (children aged 0-18). */
export function getBirthYearRange(): number[] {
    const currentJalaliYear = gregorianToJalali(new Date()).jy;
    const years: number[] = [];
    for (let y = currentJalaliYear; y >= currentJalaliYear - 18; y--) {
        years.push(y);
    }
    return years;
}