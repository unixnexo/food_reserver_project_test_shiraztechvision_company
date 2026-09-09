import { Check, X } from "lucide-react";
import { formatPersianDateString } from "@/lib/date/format-persian-date";

type DayStatus = {
    date: string;
    hasReservation: boolean;
    foodName: string | null;
    portionType: "HALF" | "FULL" | null;
};

type ChildDayListProps = {
    days: DayStatus[];
};

function getDayName(date: string) {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        weekday: "long",
    }).format(new Date(date));
}

function isToday(date: string) {
    const today = new Date();
    const target = new Date(date);

    return (
        today.getFullYear() === target.getFullYear() &&
        today.getMonth() === target.getMonth() &&
        today.getDate() === target.getDate()
    );
}

export function ChildDayList({ days }: ChildDayListProps) {
    if (days.length === 0) return null;

    return (
        <div className="mt-4 flex flex-col divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
            {days.map((day) => {
                const today = isToday(day.date);
                const dayName = today ? "امروز" : getDayName(day.date);

                return (
                    <div
                        key={day.date}
                        className={`flex items-center gap-3 px-3.5 py-3 ${day.hasReservation
                                ? "bg-background"
                                : "bg-red-50/60"
                            }`}
                    >
                        <div
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full ${day.hasReservation
                                    ? "bg-[#EAF3ED] text-[#183D2B]"
                                    : "bg-red-100 text-red-600"
                                }`}
                        >
                            {day.hasReservation ? (
                                <Check className="size-4" />
                            ) : (
                                <X className="size-4" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-medium">
                                    {dayName}
                                </span>

                                <span className="text-xs text-muted-foreground">
                                    {formatPersianDateString(day.date)}
                                </span>
                            </div>

                            {day.hasReservation ? (
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    {day.foodName} ·{" "}
                                    {day.portionType === "HALF"
                                        ? "نیم پرس"
                                        : "تمام پرس"}
                                </p>
                            ) : (
                                <p className="mt-0.5 text-xs text-red-600">
                                    غذایی رزرو نشده
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
