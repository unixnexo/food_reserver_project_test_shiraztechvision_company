import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export function ReservationHistoryEmpty() {
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-background px-6 py-14 text-center sm:py-16">
            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-[#EAF3ED] text-[#183D2B]">
                <UtensilsCrossed className="size-7" />
            </div>

            <h3 className="text-base font-semibold">
                هنوز رزروی ثبت نشده
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                رزروهای غذایی فرزندانت بعد از ثبت، اینجا نمایش داده می‌شوند.
            </p>

            <Link
                href="/dashboard"
                className="mt-6 flex h-11 items-center justify-center rounded-2xl bg-[#183D2B] px-6 text-sm font-medium text-white transition-colors hover:bg-[#24543C]"
            >
                بازگشت به داشبورد
            </Link>
        </div>
    );
}