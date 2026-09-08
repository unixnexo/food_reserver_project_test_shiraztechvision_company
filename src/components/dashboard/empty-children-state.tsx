import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyChildrenState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 px-6 py-16 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-[#EAF3ED]">
                <UserPlus className="size-7 text-[#183D2B]" />
            </div>

            <h3 className="text-base font-semibold">
                هنوز فرزندی ثبت نکرده‌ای
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                برای شروع رزرو غذا، اول باید اطلاعات فرزندت را ثبت کنی.
            </p>

            <Link href="/dashboard/register-child" className="mt-6 w-full max-w-xs">
                <Button className="h-12 w-full rounded-2xl bg-[#183D2B] text-white hover:bg-[#24543C]">
                    ثبت فرزند جدید
                </Button>
            </Link>
        </div>
    );
}