"use client";

import { CalendarX2, Loader2 } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteClosedDayDialogProps = {
    date: string | null;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
};

function formatPersianDate(dateString: string): string {
    const date = new Date(`${dateString.split("T")[0]}T00:00:00`);

    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

export function DeleteClosedDayDialog({
    date,
    isDeleting,
    onClose,
    onConfirm,
}: DeleteClosedDayDialogProps) {
    return (
        <AlertDialog
            open={Boolean(date)}
            onOpenChange={(open) => {
                if (!open && !isDeleting) {
                    onClose();
                }
            }}
        >
            <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-3xl sm:max-w-md">
                <AlertDialogHeader className="text-right">
                    <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <CalendarX2 className="size-5" />
                    </div>

                    <AlertDialogTitle className="text-lg">
                        حذف روز تعطیل؟
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-sm leading-6">
                        آیا مطمئن هستید که می‌خواهید روز{" "}
                        {date && (
                            <span className="font-semibold text-foreground">
                                «{formatPersianDate(date)}»
                            </span>
                        )}{" "}
                        را از تعطیلات حذف کنید؟
                        <br />
                        با حذف این مورد، این روز مجدداً یک روز عادی خواهد بود.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                    <AlertDialogCancel
                        disabled={isDeleting}
                        className="h-11 rounded-2xl sm:mt-0"
                    >
                        انصراف
                    </AlertDialogCancel>

                    <AlertDialogAction
                        disabled={isDeleting}
                        onClick={async (event) => {
                            event.preventDefault();
                            await onConfirm();
                        }}
                        className="h-11 rounded-2xl bg-red-600 text-white hover:bg-red-700"
                    >
                        {isDeleting && (
                            <Loader2 className="size-4 animate-spin" />
                        )}

                        حذف تعطیلی
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}