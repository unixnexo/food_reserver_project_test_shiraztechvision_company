"use client";

import { useState } from "react";
import {
    CalendarDays,
    CalendarX2,
    Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ClosedDay } from "@/app/admin/closed-days/page";

type ClosedDayFormProps = {
    closedDays: ClosedDay[];
    onSubmit: (date: Date) => Promise<void>;
    onRemove: (date: Date) => Promise<void>;
    isSubmitting: boolean;
};


export function ClosedDayForm({
    closedDays,
    onSubmit,
    onRemove,
    isSubmitting,
}: ClosedDayFormProps) {
    const today = new Date();

    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [month, setMonth] = useState<Date>(today);

    async function handleSubmit() {
        if (!selectedDate || isSubmitting) return;

        if (selectedDateIsOffDay) {
            if (selectedDateIsAlwaysOff) return;

            await onRemove(selectedDate);
            setSelectedDate(undefined);
            return;
        }

        await onSubmit(selectedDate);
        setSelectedDate(undefined);
    }

    function handleToday() {
        const today = new Date();

        setMonth(today);
        setSelectedDate(today);
    }


    const closedDateSet = new Set(
        closedDays.map((day) => day.date.split("T")[0])
    );

    function isOffDay(date: Date) {
        const dayOfWeek = date.getDay();

        // Thursday and Friday are always off
        if (dayOfWeek === 4 || dayOfWeek === 5) {
            return true;
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return closedDateSet.has(`${year}-${month}-${day}`);
    }

    const selectedDateIsOffDay = selectedDate
        ? isOffDay(selectedDate)
        : false;

    const selectedDateIsAlwaysOff = selectedDate
        ? selectedDate.getDay() === 4 || selectedDate.getDay() === 5
        : false;

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
                {/* <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={month}
                    onMonthChange={setMonth}
                    className="rounded-2xl border-0 p-0"
                /> */}

                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={month}
                    onMonthChange={setMonth}
                    modifiers={{
                        offDay: isOffDay,
                    }}
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
                    disabled={
                        !selectedDate ||
                        isSubmitting ||
                        selectedDateIsAlwaysOff
                    }
                    className={
                        selectedDateIsOffDay && !selectedDateIsAlwaysOff
                            ? "h-12 w-full rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                            : "h-12 w-full rounded-2xl bg-[#183D2B] text-white hover:bg-[#24543C]"
                    }
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {isSubmitting ? (
                            <motion.span
                                key="loading"
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.85 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-2"
                            >
                                <Loader2 className="size-4 animate-spin" />
                                در حال انجام...
                            </motion.span>
                        ) : selectedDateIsOffDay ? (
                            <motion.span
                                key="remove"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                }}
                                className="flex items-center gap-2"
                            >
                                <CalendarX2 className="size-4" />

                                {selectedDateIsAlwaysOff
                                    ? "تعطیل هفتگی"
                                    : "باز کردن روز"}
                            </motion.span>
                        ) : (
                            <motion.span
                                key="add"
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                }}
                                className="flex items-center gap-2"
                            >
                                <CalendarDays className="size-4" />
                                ثبت تعطیلی
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Button>
            </div>
        </section>
    );
}