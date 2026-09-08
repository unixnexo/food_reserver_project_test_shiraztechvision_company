"use client";

import { CalendarX2, Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import type { ClosedDay } from "@/app/admin/closed-days/page";
import { formatPersianDateString } from "@/lib/date/format-persian-date";
import { getYear, getMonth } from "date-fns-jalali";

type ClosedDayListProps = {
    closedDays: ClosedDay[];
    isLoading: boolean;
    deletingId: string | null;
    viewedMonth: Date;
    onDelete: (id: string) => void;
};

export function ClosedDayList({
    closedDays,
    isLoading,
    deletingId,
    viewedMonth,
    onDelete,
}: ClosedDayListProps) {
    const visibleClosedDays = closedDays.filter((closedDay) => {
        const closedDate = new Date(closedDay.date);

        return (
            getYear(closedDate) === getYear(viewedMonth) &&
            getMonth(closedDate) === getMonth(viewedMonth)
        );
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="size-6 animate-spin text-[#183D2B]" />
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-border/70">
            <AnimatePresence mode="popLayout" initial={false}>
                {visibleClosedDays.length > 0 ? (
                    visibleClosedDays.map((closedDay) => {
                        const isDeleting = deletingId === closedDay.id;

                        return (
                            <motion.div
                                key={closedDay.id}
                                layout
                                initial={{
                                    opacity: 0,
                                    height: 0,
                                    y: -12,
                                }}
                                animate={{
                                    opacity: 1,
                                    height: "auto",
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    height: 0,
                                    y: -12,
                                    transition: {
                                        duration: 0.2,
                                        ease: "easeOut",
                                    },
                                }}
                                transition={{
                                    layout: {
                                        duration: 0.3,
                                        ease: "easeInOut",
                                    },
                                    opacity: {
                                        duration: 0.2,
                                    },
                                    height: {
                                        duration: 0.25,
                                        ease: "easeInOut",
                                    },
                                }}
                                className="overflow-hidden border-b border-border/60 last:border-b-0"
                            >
                                <div className="flex items-center justify-between gap-4 bg-background px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <motion.div
                                            initial={{
                                                scale: 0.7,
                                                opacity: 0,
                                            }}
                                            animate={{
                                                scale: 1,
                                                opacity: 1,
                                            }}
                                            transition={{
                                                duration: 0.25,
                                                delay: 0.05,
                                            }}
                                            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]"
                                        >
                                            <CalendarX2 className="size-4" />
                                        </motion.div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {formatPersianDateString(
                                                    closedDay.date
                                                )}
                                            </p>

                                            {closedDay.reason ? (
                                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                                    {closedDay.reason}
                                                </p>
                                            ) : (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    تعطیلی ثبت شده
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={isDeleting}
                                        onClick={() =>
                                            onDelete(closedDay.id)
                                        }
                                        className="size-10 shrink-0 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="size-4" />
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <motion.div
                        key="empty"
                        initial={{
                            opacity: 0,
                            scale: 0.98,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.98,
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                        className="flex flex-col items-center justify-center rounded-3xl border-dashed px-6 py-14 text-center"
                    >
                        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <CalendarX2 className="size-6 text-muted-foreground" />
                        </div>

                        <h3 className="text-sm font-semibold">
                            تعطیلی ثبت شده‌ای در این ماه وجود ندارد
                        </h3>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                            برای مشاهده تعطیلات سایر ماه‌ها، ماه را در تقویم
                            تغییر دهید.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
