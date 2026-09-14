"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type AdminCancelReservationDialogProps = {
    orderItemId: string | null;
    childName: string;
    foodName: string;
    amount: number;
    onClose: () => void;
    onCancelled: () => void;
};

export function AdminCancelReservationDialog({
    orderItemId,
    childName,
    foodName,
    amount,
    onClose,
    onCancelled,
}: AdminCancelReservationDialogProps) {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleConfirm() {
        if (!orderItemId || !reason.trim()) return;

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/admin/reservations/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderItemId, reason: reason.trim() }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "لغو سفارش انجام نشد");
                return;
            }

            toast.success(
                data.refundedAmount > 0
                    ? `سفارش لغو شد و ${data.refundedAmount.toLocaleString("fa-IR")} تومان به کیف پول والد بازگشت داده شد`
                    : "سفارش لغو شد"
            );
            setReason("");
            onCancelled();
            onClose();
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog
            open={Boolean(orderItemId)}
            onOpenChange={(open) => {
                if (!open && !isSubmitting) {
                    setReason("");
                    onClose();
                }
            }}
        >
            <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl sm:max-w-md">
                <DialogHeader className="text-right">
                    <DialogTitle className="text-lg">لغو این سفارش؟</DialogTitle>
                    <DialogDescription className="text-sm leading-6">
                        سفارش {foodName} برای {childName} لغو می‌شود
                        {amount > 0 &&
                            ` و مبلغ ${amount.toLocaleString("fa-IR")} تومان به کیف پول والد بازگردانده خواهد شد`}
                        . یک پیامک شامل دلیل لغو برای والد ارسال می‌شود.
                    </DialogDescription>
                </DialogHeader>

                <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="توضیحات لغو (الزامی) — مثلاً: تعطیلی مدرسه، اتمام موجودی غذا"
                    disabled={isSubmitting}
                    className="min-h-24 rounded-2xl border-border/70 bg-muted/40 px-4 py-3 text-sm shadow-none"
                />

                <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={() => {
                            setReason("");
                            onClose();
                        }}
                        className="h-11 rounded-2xl"
                    >
                        انصراف
                    </Button>

                    <Button
                        type="button"
                        disabled={isSubmitting || !reason.trim()}
                        onClick={handleConfirm}
                        className="h-11 rounded-2xl bg-red-600 text-white hover:bg-red-700"
                    >
                        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                        لغو سفارش
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}