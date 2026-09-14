"use client";

import { useEffect, useState } from "react";
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

type FoodOption = { id: string; food: { id: string; name: string } };

type EditReservationDialogProps = {
    orderItemId: string | null;
    childName: string;
    onClose: () => void;
    onEdited: () => void;
};

export function EditReservationDialog({
    orderItemId,
    childName,
    onClose,
    onEdited,
}: EditReservationDialogProps) {
    const [options, setOptions] = useState<FoodOption[]>([]);
    const [currentMenuItemId, setCurrentMenuItemId] = useState<string | null>(null);
    const [selectedMenuItemId, setSelectedMenuItemId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!orderItemId) return;

        setIsLoading(true);
        setOptions([]);
        setSelectedMenuItemId(null);

        fetch(`/api/reservations/edit/options?orderItemId=${orderItemId}`)
            .then((res) => res.json())
            .then((data) => {
                if (!data.success) {
                    toast.error(data.error || "خطا در دریافت گزینه‌های غذا");
                    return;
                }
                setOptions(data.options);
                setCurrentMenuItemId(data.currentMenuItemId);
                setSelectedMenuItemId(data.currentMenuItemId);
            })
            .catch(() => toast.error("خطا در ارتباط با سرور"))
            .finally(() => setIsLoading(false));
    }, [orderItemId]);

    async function handleSubmit() {
        if (!orderItemId || !selectedMenuItemId) return;

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/reservations/edit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderItemId,
                    newMenuItemId: selectedMenuItemId,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "ویرایش رزرو انجام نشد");
                return;
            }

            toast.success("رزرو با موفقیت ویرایش شد");
            onEdited();
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
            onOpenChange={(open) => !open && !isSubmitting && onClose()}
        >
            <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl sm:max-w-md">
                <DialogHeader className="text-right">
                    <DialogTitle className="text-lg">تغییر غذا</DialogTitle>
                    <DialogDescription className="text-sm leading-6">
                        غذای رزرو‌شده برای {childName} را تغییر دهید. نوع پرس (نیم/تمام) قابل
                        تغییر نیست.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-[#183D2B]" />
                    </div>
                ) : options.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        گزینه دیگری برای این روز موجود نیست.
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {options.map((option) => {
                            const isSelected = selectedMenuItemId === option.id;
                            const isCurrent = currentMenuItemId === option.id;

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setSelectedMenuItemId(option.id)}
                                    disabled={isSubmitting}
                                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-colors ${isSelected
                                            ? "border-[#183D2B] bg-[#EAF3ED] font-medium"
                                            : "border-border/70 bg-background"
                                        }`}
                                >
                                    <span>{option.food.name}</span>
                                    {isCurrent && (
                                        <span className="text-xs text-muted-foreground">
                                            انتخاب فعلی
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={onClose}
                        className="h-11 rounded-2xl"
                    >
                        انصراف
                    </Button>

                    <Button
                        type="button"
                        disabled={
                            isSubmitting ||
                            !selectedMenuItemId ||
                            selectedMenuItemId === currentMenuItemId
                        }
                        onClick={handleSubmit}
                        className="h-11 rounded-2xl bg-[#183D2B] text-white hover:bg-[#24543C]"
                    >
                        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                        ذخیره تغییرات
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}