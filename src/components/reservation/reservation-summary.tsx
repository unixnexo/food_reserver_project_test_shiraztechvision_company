"use client";

import { useState } from "react";
import { CalendarCheck2, ChevronDown, Loader2, UtensilsCrossed } from "lucide-react";
import { formatPersianDateString } from "@/lib/date/format-persian-date";

type MenuItem = { id: string; food: { id: string; name: string } };
type PortionType = "HALF" | "FULL";

type DaySelection = {
    date: string;
    menuItemId: string | null;
    portionType: PortionType | null;
    availableMenuItems: MenuItem[] | null;
};

type ReservationSummaryProps = {
    childName: string;
    daySelections: DaySelection[];
    calculateItemPrice: (portionType: PortionType) => number;
    totalAmount: number;
};

export function ReservationSummary({
    childName,
    daySelections,
    calculateItemPrice,
    totalAmount,
}: ReservationSummaryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dayCount = daySelections.length;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-[#EAF3ED] px-4 py-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#183D2B] text-white">
                    <CalendarCheck2 className="size-4.5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-[#183D2B]/70">رزرو برای</p>
                    <p className="truncate text-sm font-semibold text-[#183D2B]">
                        {childName} · {dayCount.toLocaleString("fa-IR")} روز
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/70">
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="flex w-full items-center gap-3 bg-background px-4 py-3.5 text-right transition-colors hover:bg-muted/30"
                >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]">
                        <UtensilsCrossed className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">جزئیات رزرو</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {dayCount.toLocaleString("fa-IR")} روز انتخاب شده
                        </p>
                    </div>

                    <ChevronDown
                        className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""
                            }`}
                    />
                </button>

                {isOpen && (
                    <div className="flex flex-col divide-y divide-border/60 border-t border-border/60">
                        {daySelections.map((ds) => {
                            const food = ds.availableMenuItems?.find(
                                (mi) => mi.id === ds.menuItemId
                            );

                            return (
                                <div
                                    key={ds.date}
                                    className="flex items-center gap-3 bg-background px-4 py-3.5"
                                >
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]">
                                        <UtensilsCrossed className="size-4" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {formatPersianDateString(ds.date)}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                            {food?.food.name} ·{" "}
                                            {ds.portionType === "HALF" ? "نیم پرس" : "تمام پرس"}
                                        </p>
                                    </div>

                                    <span className="shrink-0 text-sm font-semibold">
                                        {ds.portionType &&
                                            calculateItemPrice(ds.portionType).toLocaleString(
                                                "fa-IR"
                                            )}{" "}
                                        <span className="font-normal text-muted-foreground">
                                            تومان
                                        </span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[#183D2B] px-5 py-4 text-white">
                <div>
                    <p className="text-xs text-white/70">مبلغ قابل پرداخت</p>
                    <p className="mt-0.5 text-lg font-bold">
                        {totalAmount.toLocaleString("fa-IR")} تومان
                    </p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium">
                    {dayCount.toLocaleString("fa-IR")} وعده
                </span>
            </div>
        </div>
    );
}

export function SubmitSpinner() {
    return <Loader2 className="size-4 animate-spin" />;
}