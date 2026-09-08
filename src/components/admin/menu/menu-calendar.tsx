"use client";

import { CalendarDays } from "lucide-react";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getYear, getMonth } from "date-fns-jalali";

type ClosedDay = {
    id: string;
    date: string;
    reason: string | null;
};

type MenuCalendarProps = {
    selectedDate: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    closedDays: ClosedDay[];
    refreshKey: number;
};

export function MenuCalendar({
    selectedDate,
    onSelect,
    closedDays,
    refreshKey,
}: MenuCalendarProps) {

    const today = new Date();

    const [month, setMonth] = useState<Date>(
        selectedDate ?? today
    );

    const [countsCache, setCountsCache] = useState<
        Record<string, Record<string, number>>
    >({});

    function isOffDay(date: Date) {
        const dayOfWeek = date.getDay();

        if (dayOfWeek === 4 || dayOfWeek === 5) {
            return true;
        }

        return closedDays.some((closedDay) => {
            const closedDate = new Date(closedDay.date);

            return (
                getYear(closedDate) === getYear(date) &&
                getMonth(closedDate) === getMonth(date) &&
                closedDate.getUTCDate() === date.getDate()
            );
        });
    }

    useEffect(() => {
        const year = month.getFullYear();
        const gregorianMonth = month.getMonth() + 1;
        const cacheKey = `${year}-${gregorianMonth}`;

        let cancelled = false;

        async function loadCounts() {
            try {
                const res = await fetch(
                    `/api/admin/menu-items/summary?year=${year}&month=${gregorianMonth}`
                );

                const data = await res.json();

                if (cancelled || !res.ok || !data.success) return;

                setCountsCache((prev) => ({
                    ...prev,
                    [cacheKey]: data.counts,
                }));
            } catch {
                // silent — counts are non-critical
            }
        }

        loadCounts();

        return () => {
            cancelled = true;
        };
    }, [month, refreshKey]);

    function getFoodCount(date: Date): number {
        const year = date.getFullYear();
        const gregorianMonth = date.getMonth() + 1;
        const cacheKey = `${year}-${gregorianMonth}`;

        const day = String(date.getDate()).padStart(2, "0");
        const monthStr = String(gregorianMonth).padStart(2, "0");
        const dateKey = `${year}-${monthStr}-${day}`;

        return countsCache[cacheKey]?.[dateKey] ?? 0;
    }

    return (
        <section className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#EAF3ED] text-[#183D2B]">
                    <CalendarDays className="size-5" />
                </div>

                <div>
                    <h2 className="text-base font-semibold">
                        انتخاب روز
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                        روز موردنظر برای تنظیم منو را انتخاب کنید.
                    </p>
                </div>
            </div>

            <div className="flex justify-center">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={onSelect}
                    month={month}
                    onMonthChange={setMonth}
                    modifiers={{
                        offDay: isOffDay,
                    }}
                    components={{
                        DayButton: (props) => (
                            <CalendarDayButton
                                {...props}
                                foodCount={getFoodCount(props.day.date)}
                            />
                        ),
                    }}
                    className="rounded-2xl border-0 p-0"
                />
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={() => {
                    const today = new Date();

                    setMonth(today);
                    onSelect(today);
                }}
                className="mt-4 h-11 w-full rounded-2xl border-border/70"
            >
                <CalendarDays className="size-4" />
                امروز
            </Button>
        </section>
    );
}
