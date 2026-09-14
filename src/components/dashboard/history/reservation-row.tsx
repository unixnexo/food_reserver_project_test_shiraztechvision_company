"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import type { Reservation } from "@/app/dashboard/history/page";
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
import { Button } from "@/components/ui/button";

type ReservationRowProps = {
    reservation: Reservation;
    onCancelled: () => void;
};

const STATUS_LABELS: Record<Reservation["orderStatus"], string> = {
    PENDING: "در انتظار پرداخت",
    PAID: "پرداخت شده",
    FAILED: "ناموفق",
    CANCELLED: "لغو شده",
};

const STATUS_STYLES: Record<Reservation["orderStatus"], string> = {
    PENDING: "bg-amber-50 text-amber-700",
    PAID: "bg-[#EAF3ED] text-[#183D2B]",
    FAILED: "bg-red-50 text-red-600",
    CANCELLED: "bg-muted text-muted-foreground",
};

export function ReservationRow({ reservation, onCancelled }: ReservationRowProps) {
    const isHalf = reservation.portionType === "HALF";
    const isItemCancelled = reservation.itemStatus === "CANCELLED";

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    async function handleConfirmCancel() {
        setIsCancelling(true);
        try {
            const res = await fetch("/api/reservations/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderItemId: reservation.orderItemId }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "لغو رزرو انجام نشد");
                return;
            }

            toast.success(
                data.refundedAmount > 0
                    ? `رزرو لغو شد و ${data.refundedAmount.toLocaleString("fa-IR")} تومان به کیف پول شما بازگشت داده شد`
                    : "رزرو لغو شد"
            );
            setIsDialogOpen(false);
            onCancelled();
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsCancelling(false);
        }
    }

    return (
        <div
            className={`flex items-center justify-between gap-4 px-5 py-4 sm:px-6 ${isItemCancelled ? "opacity-60" : ""}`}
        >
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                    {reservation.childName}
                </p>

                <p
                    className={`mt-1 truncate text-sm text-muted-foreground ${isItemCancelled ? "line-through" : ""}`}
                >
                    {reservation.foodName}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        {isHalf ? "نیم‌پرس" : "تمام‌پرس"}
                    </span>

                    <span className="text-muted-foreground/50">·</span>

                    <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[reservation.orderStatus]} `}
                    >
                        {STATUS_LABELS[reservation.orderStatus]}
                    </span>

                    {isItemCancelled && (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            این روز لغو شده
                        </span>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
                <div className="text-left">
                    <p className="text-sm font-semibold tabular-nums">
                        {reservation.amount.toLocaleString("fa-IR")}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">تومان</p>
                </div>

                {reservation.canCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDialogOpen(true)}
                        className="size-9 shrink-0 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600"
                    >
                        <X className="size-4" />
                    </Button>
                )}
            </div>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-3xl sm:max-w-md">
                    <AlertDialogHeader className="text-right">
                        <AlertDialogTitle className="text-lg">
                            لغو این رزرو؟
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm leading-6">
                            رزرو {reservation.foodName} برای {reservation.childName} لغو
                            می‌شود و مبلغ {reservation.amount.toLocaleString("fa-IR")} تومان
                            به کیف پول شما بازگردانده خواهد شد.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                        <AlertDialogCancel disabled={isCancelling} className="h-11 rounded-2xl sm:mt-0">
                            انصراف
                        </AlertDialogCancel>

                        <AlertDialogAction
                            disabled={isCancelling}
                            onClick={async (e) => {
                                e.preventDefault();
                                await handleConfirmCancel();
                            }}
                            className="h-11 rounded-2xl bg-red-600 text-white hover:bg-red-700"
                        >
                            {isCancelling && <Loader2 className="size-4 animate-spin" />}
                            لغو رزرو
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}