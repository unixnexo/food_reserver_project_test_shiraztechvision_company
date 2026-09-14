"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CalendarX2 } from "lucide-react";
import toast from "react-hot-toast";

import { ClosedDayForm } from "@/components/admin/closed-days/closed-day-form";
import { ClosedDayList } from "@/components/admin/closed-days/closed-day-list";
import { DeleteClosedDayDialog } from "@/components/admin/closed-days/delete-closed-day-dialog";

export type ClosedDay = {
    id: string;
    date: string;
    reason: string | null;
};

function toDateParam(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export default function AdminClosedDaysPage() {
    const [closedDays, setClosedDays] = useState<ClosedDay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedClosedDay, setSelectedClosedDay] =
        useState<ClosedDay | null>(null);
    const [viewedMonth, setViewedMonth] = useState<Date>(new Date());

    const [deletingId, setDeletingId] = useState<string | null>(null);

    async function loadClosedDays() {
        try {
            setIsLoading(true);

            const res = await fetch("/api/admin/closed-days", {
                cache: "no-store",
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "خطا در دریافت روزهای تعطیل");
                return;
            }

            setClosedDays(data.closedDays);
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadClosedDays();
    }, []);

    async function handleAddClosure(selectedDate: Date) {
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/admin/closed-days", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    date: toDateParam(selectedDate),
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "ثبت تعطیلی انجام نشد");
                return;
            }

            // Add the exact record returned by the API.
            setClosedDays((prev) => {
                const next = [...prev, data.closedDay];

                next.sort(
                    (a, b) =>
                        a.date.localeCompare(b.date)
                );

                return next;
            });

            toast.success("روز مورد نظر تعطیل شد");
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleRemoveClosureByDate(selectedDate: Date) {
        const dateParam = toDateParam(selectedDate);

        const closedDay = closedDays.find(
            (day) => day.date.split("T")[0] === dateParam
        );

        if (!closedDay) return;

        setIsSubmitting(true);

        try {
            const res = await fetch(
                `/api/admin/closed-days/${closedDay.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "باز کردن روز انجام نشد");
                return;
            }

            setClosedDays((prev) =>
                prev.filter((day) => day.id !== closedDay.id)
            );

            toast.success("روز مجدداً باز شد");
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleRemoveClosure() {
        if (!selectedClosedDay) return;

        const id = selectedClosedDay.id;

        setDeletingId(id);

        try {
            const res = await fetch(`/api/admin/closed-days/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "حذف تعطیلی انجام نشد");
                return;
            }

            setClosedDays((prev) =>
                prev.filter((day) => day.id !== id)
            );

            toast.success("روز مجدداً باز شد");

            setSelectedClosedDay(null);
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="mx-auto w-full max-w-6xl">
            <div className="mb-8 overflow-hidden rounded-2xl border border-[#DCE3DE] bg-white shadow-sm">
                <div className="h-1 bg-[#183D2B]" />

                <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]">
                        <CalendarX2 className="size-5" />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[#183D2B] sm:text-2xl">
                            روزهای تعطیل
                        </h1>

                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            روزهای تعطیل اضافه را مشخص کنید. پنجشنبه و جمعه به‌صورت
                            پیش‌فرض تعطیل هستند.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
                <ClosedDayForm
                    closedDays={closedDays}
                    onSubmit={handleAddClosure}
                    onRemove={handleRemoveClosureByDate}
                    isSubmitting={isSubmitting}
                    onMonthChange={setViewedMonth}
                />

                <section className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                    <div className="mb-6 flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3ED] text-[#183D2B]">
                            <CalendarDays className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base font-semibold">
                                تعطیلات ثبت شده
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                برای مشاهده تعطیلات سایر ماه‌ها، ماه را در
                                تقویم تغییر دهید.
                            </p>
                        </div>
                    </div>

                    <ClosedDayList
                        closedDays={closedDays}
                        isLoading={isLoading}
                        deletingId={deletingId}
                        viewedMonth={viewedMonth}
                        onDelete={(id) => {
                            const day = closedDays.find(
                                (item) => item.id === id
                            );

                            if (day) {
                                setSelectedClosedDay(day);
                            }
                        }}
                    />
                </section>
            </div>

            <DeleteClosedDayDialog
                date={selectedClosedDay?.date ?? null}
                isDeleting={Boolean(deletingId)}
                onClose={() => setSelectedClosedDay(null)}
                onConfirm={handleRemoveClosure}
            />
        </div>
    );
}
