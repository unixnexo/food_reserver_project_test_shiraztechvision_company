"use client";

import { useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

type ClosedDayFormProps = {
    onSubmit: (date: Date) => Promise<void>;
    isSubmitting: boolean;
};

export function ClosedDayForm({
    onSubmit,
    isSubmitting,
}: ClosedDayFormProps) {
    const today = new Date();

    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [month, setMonth] = useState<Date>(today);

    async function handleSubmit() {
        if (!selectedDate || isSubmitting) return;

        await onSubmit(selectedDate);
        setSelectedDate(undefined);
    }

    function handleToday() {
        const today = new Date();

        setMonth(today);
        setSelectedDate(today);
    }

    return (
        <section className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3ED] text-[#183D2B]">
                    <CalendarDays className="size-5" />
                </div>

                <div>
                    <h2 className="text-base font-semibold">
                        افزودن روز تعطیل
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                        روزی را که می‌خواهید تعطیل شود انتخاب کنید.
                    </p>
                </div>
            </div>

            <div className="flex justify-center">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={month}
                    onMonthChange={setMonth}
                    className="rounded-2xl border-0 p-0"
                />
            </div>

            <div className="mt-4 space-y-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleToday}
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-2xl border-border/70"
                >
                    <CalendarDays className="size-4" />
                    امروز
                </Button>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!selectedDate || isSubmitting}
                    className="h-12 w-full rounded-2xl bg-[#183D2B] text-white hover:bg-[#24543C]"
                >
                    {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <CalendarDays className="size-4" />
                    )}
                    ثبت تعطیلی
                </Button>
            </div>
        </section>
    );
}