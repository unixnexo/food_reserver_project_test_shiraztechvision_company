"use client";

import { CalendarX2, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ClosedDay } from "@/app/admin/closed-days/page";

type ClosedDayListProps = {
    closedDays: ClosedDay[];
    isLoading: boolean;
    deletingId: string | null;
    onDelete: (id: string) => void;
};

function formatPersianDate(dateString: string): string {
    const date = new Date(`${dateString.split("T")[0]}T00:00:00`);

    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

export function ClosedDayList({
    closedDays,
    isLoading,
    deletingId,
    onDelete,
}: ClosedDayListProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="size-6 animate-spin text-[#183D2B]" />
            </div>
        );
    }

    if (closedDays.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 px-6 py-14 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                    <CalendarX2 className="size-6 text-muted-foreground" />
                </div>

                <h3 className="text-sm font-semibold">
                    تعطیلی اضافه‌ای ثبت نشده است
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                    از بخش بالا یک روز را انتخاب کنید تا به روزهای تعطیل اضافه
                    شود.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-border/60 overflow-hidden rounded-3xl border border-border/70">
            {closedDays.map((closedDay) => {
                const isDeleting = deletingId === closedDay.id;

                return (
                    <div
                        key={closedDay.id}
                        className="flex items-center justify-between gap-4 bg-background px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]">
                                <CalendarX2 className="size-4" />
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                    {formatPersianDate(closedDay.date)}
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
                            onClick={() => onDelete(closedDay.id)}
                            className="size-10 shrink-0 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        >
                            {isDeleting ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Trash2 className="size-4" />
                            )}
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}