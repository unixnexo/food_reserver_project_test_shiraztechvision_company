import { UserPlus } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";

export function PageHeader() {
    return (
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#DCE3DE] bg-white shadow-sm">
            <div className="h-1 bg-[#183D2B]" />

            <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                <BackButton className="size-11 shrink-0 rounded-xl" />

                <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#183D2B] sm:text-2xl">
                        ثبت اطلاعات فرزند
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        اطلاعات فرزندتان را برای ثبت در سامانه وارد کنید
                    </p>
                </div>
            </div>
        </div>
    );
}