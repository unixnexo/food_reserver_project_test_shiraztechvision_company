import { Check, X } from "lucide-react";

type DayStatus = {
    date: string;
    hasReservation: boolean;
};

type ChildStatusPillsProps = {
    days: DayStatus[];
};

const DAY_LABELS = ["امروز", "فردا", "پس‌فردا"];

export function ChildStatusPills({ days }: ChildStatusPillsProps) {
    if (days.length === 0) return null;

    return (
        <div className="mt-4 flex gap-2">
            {days.map((day, index) => (
                <div
                    key={day.date}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2.5 ${day.hasReservation
                            ? "bg-[#EAF3ED] text-[#183D2B]"
                            : "bg-red-50 text-red-600"
                        }`}
                >
                    {day.hasReservation ? (
                        <Check className="size-4" />
                    ) : (
                        <X className="size-4" />
                    )}
                    <span className="text-[11px] font-medium">
                        {DAY_LABELS[index] ?? ""}
                    </span>
                </div>
            ))}
        </div>
    );
}