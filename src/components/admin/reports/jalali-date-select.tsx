"use client";

import { useMemo } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    getCurrentJalaliYear,
    getJalaliDayOptions,
    getJalaliMonthOptions,
    getJalaliYearOptions,
} from "@/lib/date/jalali-select-options";
import { jalaliToGregorian } from "@/lib/date/jalali";

type JalaliDateSelectProps = {
    jy: number | null;
    jm: number | null;
    jd: number | null;
    onChange: (params: {
        jy: number | null;
        jm: number | null;
        jd: number | null;
        gregorian: string | null;
    }) => void;
};

export function JalaliDateSelect({
    jy,
    jm,
    jd,
    onChange,
}: JalaliDateSelectProps) {
    const years = useMemo(() => getJalaliYearOptions(), []);
    const months = useMemo(() => getJalaliMonthOptions(), []);

    const days = useMemo(() => {
        const effectiveYear = jy ?? getCurrentJalaliYear();
        const effectiveMonth = jm ?? 1;
        return getJalaliDayOptions(effectiveYear, effectiveMonth);
    }, [jy, jm]);

    function emit(nextJy: number | null, nextJm: number | null, nextJd: number | null) {
        if (nextJy && nextJm && nextJd) {
            const gregorianDate = jalaliToGregorian(nextJy, nextJm, nextJd);
            const iso = gregorianDate.toISOString().split("T")[0];
            onChange({ jy: nextJy, jm: nextJm, jd: nextJd, gregorian: iso });
        } else {
            onChange({ jy: nextJy, jm: nextJm, jd: nextJd, gregorian: null });
        }
    }

    return (
        <div className="grid grid-cols-3 gap-2">
            <Select
                value={jd ? String(jd) : undefined}
                onValueChange={(v) => emit(jy, jm, Number(v))}
            >
                <SelectTrigger className="h-10 w-full rounded-xl">
                    <SelectValue placeholder="روز" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                    {days.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                            {d}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={jm ? String(jm) : undefined}
                onValueChange={(v) => emit(jy, Number(v), jd)}
            >
                <SelectTrigger className="h-10 w-full rounded-xl">
                    <SelectValue placeholder="ماه" />
                </SelectTrigger>
                <SelectContent>
                    {months.map((m) => (
                        <SelectItem key={m.value} value={String(m.value)}>
                            {m.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={jy ? String(jy) : undefined}
                onValueChange={(v) => emit(Number(v), jm, jd)}
            >
                <SelectTrigger className="h-10 w-full rounded-xl">
                    <SelectValue placeholder="سال" />
                </SelectTrigger>
                <SelectContent>
                    {years.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                            {y}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}