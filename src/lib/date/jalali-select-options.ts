import { getBirthYearRange, jalaliMonthLength, PERSIAN_MONTH_NAMES, gregorianToJalali } from "@/lib/date/jalali";

export function getCurrentJalaliYear(): number {
    return gregorianToJalali(new Date()).jy;
}

export function getJalaliYearOptions(): number[] {
    const currentYear = getCurrentJalaliYear();
    const years: number[] = [];
    for (let y = currentYear + 1; y >= currentYear - 5; y--) {
        years.push(y);
    }
    return years;
}

export function getJalaliMonthOptions() {
    return PERSIAN_MONTH_NAMES.map((name, index) => ({
        value: index + 1,
        label: name,
    }));
}

export function getJalaliDayOptions(jy: number, jm: number): number[] {
    const length = jalaliMonthLength(jy, jm);
    return Array.from({ length }, (_, i) => i + 1);
}