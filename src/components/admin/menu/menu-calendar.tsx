"use client";

import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type MenuCalendarProps = {
    selectedDate: Date | undefined;
    onSelect: (date: Date | undefined) => void;
};

export function MenuCalendar({
    selectedDate,
    onSelect,
}: MenuCalendarProps) {

    const today = new Date();

    const [month, setMonth] = useState<Date>(
        selectedDate ?? today
    );

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