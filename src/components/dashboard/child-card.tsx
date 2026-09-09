import Link from "next/link";
import { UtensilsCrossed, CalendarDays, GraduationCap, AlertCircle } from "lucide-react";
import { ChildDayList } from "@/components/dashboard/child-day-list";

type DayStatus = {
    date: string;
    hasReservation: boolean;
    foodName: string | null;
    portionType: "HALF" | "FULL" | null;
};

type ChildCardProps = {
    id: string;
    firstName: string;
    lastName: string;
    schoolName: string;
    gradeName: string;
    days: DayStatus[];
    needsAction: boolean;
};

export function ChildCard({
    id,
    firstName,
    lastName,
    schoolName,
    gradeName,
    days,
    needsAction,
}: ChildCardProps) {
    return (
        <div
            className={`rounded-3xl border bg-background p-5 shadow-sm transition-colors sm:p-6 ${needsAction ? "border-red-200" : "border-border/70"
                }`}
        >
            <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3ED] text-lg font-bold text-[#183D2B]">
                    {firstName.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold">
                        {firstName} {lastName}
                    </h3>

                    <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <GraduationCap className="size-4 shrink-0" />
                        <span className="truncate">
                            {schoolName} · {gradeName}
                        </span>
                    </div>
                </div>
            </div>

            <ChildDayList days={days} />

            {needsAction && (
                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>
                        قبل از ساعت ۵ عصر امروز برای فردا رزرو کن، وگرنه دیر میشه!
                    </span>
                </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2.5">
                <Link
                    href={`/dashboard/reserve/daily?childId=${id}`}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#183D2B] px-3 text-sm font-medium text-white transition-colors hover:bg-[#24543C]"
                >
                    <UtensilsCrossed className="size-4" />
                    رزرو روزانه
                </Link>

                <Link
                    href={`/dashboard/reserve/monthly?childId=${id}`}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border/70 px-3 text-sm font-medium transition-colors hover:bg-muted/50"
                >
                    <CalendarDays className="size-4" />
                    رزرو ماهانه
                </Link>
            </div>
        </div>
    );
}