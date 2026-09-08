import { Loader2 } from "lucide-react";
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
    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-[#EAF3ED] px-4 py-3">
                <p className="text-xs text-muted-foreground">رزرو برای</p>
                <p className="mt-0.5 text-sm font-semibold text-[#183D2B]">
                    {childName}
                </p>
            </div>

            <div className="flex flex-col divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
                {daySelections.map((ds) => {
                    const food = ds.availableMenuItems?.find(
                        (mi) => mi.id === ds.menuItemId
                    );

                    return (
                        <div
                            key={ds.date}
                            className="flex items-center justify-between gap-3 bg-background px-4 py-3"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                    {formatPersianDateString(ds.date)}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    {food?.food.name} ·{" "}
                                    {ds.portionType === "HALF" ? "نیم پرس" : "تمام پرس"}
                                </p>
                            </div>

                            <span className="shrink-0 text-sm font-medium">
                                {ds.portionType &&
                                    calculateItemPrice(ds.portionType).toLocaleString("fa-IR")}{" "}
                                تومان
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[#183D2B] px-5 py-4 text-white">
                <span className="text-sm font-medium">مبلغ قابل پرداخت</span>
                <span className="text-lg font-bold">
                    {totalAmount.toLocaleString("fa-IR")} تومان
                </span>
            </div>
        </div>
    );
}

export function SubmitSpinner() {
    return <Loader2 className="size-4 animate-spin" />;
}