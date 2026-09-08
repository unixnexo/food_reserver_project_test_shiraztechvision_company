import Link from "next/link";
import { UtensilsCrossed, CalendarDays, GraduationCap } from "lucide-react";

type ChildCardProps = {
    id: string;
    firstName: string;
    lastName: string;
    schoolName: string;
    gradeName: string;
};

export function ChildCard({
    id,
    firstName,
    lastName,
    schoolName,
    gradeName,
}: ChildCardProps) {
    return (
        <div className="rounded-3xl border border-border/70 bg-background p-5 shadow-sm sm:p-6">
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