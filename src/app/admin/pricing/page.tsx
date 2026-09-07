"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Tags } from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/format-price";

import { Button } from "@/components/ui/button";

export default function AdminPricingPage() {
    const [halfPortionPrice, setHalfPortionPrice] = useState("");
    const [fullPortionPrice, setFullPortionPrice] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        async function loadPricing() {
            try {
                const res = await fetch("/api/admin/portion-pricing");
                const data = await res.json();

                if (!res.ok || !data.success || !data.pricing) {
                    toast.error(data.error || "خطا در دریافت قیمت‌ها");
                    return;
                }

                setHalfPortionPrice(
                    String(data.pricing.halfPortionPrice)
                );

                setFullPortionPrice(
                    String(data.pricing.fullPortionPrice)
                );
            } catch {
                toast.error("خطا در ارتباط با سرور");
            } finally {
                setIsLoading(false);
            }
        }

        loadPricing();
    }, []);

    async function handleSave() {
        const halfPrice = Number(halfPortionPrice);
        const fullPrice = Number(fullPortionPrice);

        if (!halfPortionPrice || !fullPortionPrice) {
            toast.error("لطفاً هر دو قیمت را وارد کنید");
            return;
        }

        if (
            !Number.isInteger(halfPrice) ||
            !Number.isInteger(fullPrice) ||
            halfPrice < 0 ||
            fullPrice < 0
        ) {
            toast.error("قیمت‌ها باید عدد صحیح باشند");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/admin/portion-pricing", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    halfPortionPrice: halfPrice,
                    fullPortionPrice: fullPrice,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "بروزرسانی قیمت‌ها انجام نشد");
                return;
            }

            toast.success("قیمت‌ها با موفقیت بروزرسانی شد");
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="mx-auto flex min-h-[300px] w-full max-w-6xl items-center justify-center">
                <Loader2 className="size-6 animate-spin text-[#183D2B]" />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl">
            <div className="mb-8">
                <div className="mb-2 flex items-center gap-3">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3ED] text-[#183D2B]">
                        <Tags className="size-6" />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        قیمت‌گذاری
                    </h1>
                </div>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    قیمت نیم پرس و تمام پرس را برای سفارش‌های جدید تنظیم کنید.
                </p>
            </div>

            <section className="max-w-2xl rounded-3xl border border-border/70 bg-background p-5 shadow-sm sm:p-8">
                <div className="mb-8">
                    <h2 className="text-lg font-semibold">
                        قیمت پرس‌ها
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        قیمت‌ها به تومان و به‌صورت عدد صحیح وارد شوند.
                    </p>
                </div>

                <div className="space-y-8">
                    <div>
                        <label
                            htmlFor="half"
                            className="mb-3 block text-base font-medium text-muted-foreground"
                        >
                            نیم پرس
                        </label>

                        <div className="flex items-end gap-3">
                            <input
                                id="half"
                                type="text"
                                inputMode="numeric"
                                value={formatPrice(halfPortionPrice)}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setHalfPortionPrice(value);
                                }}
                                disabled={isSubmitting}
                                dir="ltr"
                                className="h-16 min-w-0 flex-1 border-0 border-b-2 border-border bg-transparent px-0 text-xl font-medium tracking-wide outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary sm:text-2xl"
                                placeholder="مثلاً ۵۰٬۰۰۰"
                            />

                            <span className="mb-3 shrink-0 text-sm font-medium text-muted-foreground">
                                تومان
                            </span>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="full"
                            className="mb-3 block text-base font-medium text-muted-foreground"
                        >
                            تمام پرس
                        </label>

                        <div className="flex items-end gap-3">
                            <input
                                id="full"
                                type="text"
                                inputMode="numeric"
                                value={formatPrice(fullPortionPrice)}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setFullPortionPrice(value);
                                }}
                                disabled={isSubmitting}
                                dir="ltr"
                                className="h-16 min-w-0 flex-1 border-0 border-b-2 border-border bg-transparent px-0 text-xl font-medium tracking-wide outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary sm:text-2xl"
                                placeholder="مثلاً ۸۰٬۰۰۰"
                            />

                            <span className="mb-3 shrink-0 text-sm font-medium text-muted-foreground">
                                تومان
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-10 border-t border-border/60 pt-6">
                    <div className="mb-5 rounded-2xl bg-muted/40 px-4 py-3">
                        <p className="text-xs leading-6 text-muted-foreground">
                            تغییر قیمت فقط روی سفارش‌های جدید اعمال می‌شود و
                            قیمت سفارش‌های قبلی تغییر نخواهد کرد.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={
                            isSubmitting ||
                            !halfPortionPrice ||
                            !fullPortionPrice
                        }
                        className="h-12 w-full rounded-2xl bg-[#183D2B] text-white hover:bg-[#24543C]"
                    >
                        {isSubmitting ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Save className="size-4" />
                        )}

                        ذخیره قیمت‌ها
                    </Button>
                </div>
            </section>
        </div>
    );

}
