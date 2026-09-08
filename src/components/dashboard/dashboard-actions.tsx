import Link from "next/link";
import { UserPlus, History, ChevronLeft } from "lucide-react";

export function DashboardActions() {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <Link
                href="/dashboard/register-child"
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-background px-5 py-4 transition-colors hover:bg-muted/40"
            >
                <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]">
                        <UserPlus className="size-5" />
                    </div>
                    <span className="text-sm font-medium">ثبت فرزند جدید</span>
                </div>
                <ChevronLeft className="size-4 text-muted-foreground" />
            </Link>

            <Link
                href="/dashboard/history"
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-background px-5 py-4 transition-colors hover:bg-muted/40"
            >
                <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]">
                        <History className="size-5" />
                    </div>
                    <span className="text-sm font-medium">تاریخچه رزروها</span>
                </div>
                <ChevronLeft className="size-4 text-muted-foreground" />
            </Link>
        </div>
    );
}