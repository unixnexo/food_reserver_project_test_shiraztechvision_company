// src/app/dashboard/reserve/daily/page.tsx
//
// PAGE PURPOSE (for AI agents / future readers):
// Full daily-reservation flow for a logged-in parent, in three phases
// (tracked via local state, single page):
//
//   Phase "child"   — pick which registered child this reservation is for.
//   Phase "days"    — Persian calendar (multi-select) restricted to dates
//                      returned by GET /api/reservations/daily/available-days
//                      (already filtered server-side for cutoff/month/
//                      school-day rules — the UI does not re-implement
//                      that logic, it just disables anything not in the
//                      returned list).
//   Phase "food"    — for EACH selected day, fetch that day's available
//                      menu (GET /api/reservations/menu?date=...) and let
//                      the parent pick one food + one portion size
//                      (نیم پرس / تمام پرس) for that day.
//   Phase "summary" — shows all selections + computed total, then submits
//                      to POST /api/reservations/daily. On success, the
//                      order is PENDING — next step (Step 8) will redirect
//                      to Zarinpal payment from here.
//
// This is intentionally bare-bones styling — full UI/UX pass happens
// later. Structure and data flow are the priority.

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Child = {
    id: string;
    firstName: string;
    lastName: string;
    school: { name: string };
    grade: { name: string };
};

type MenuItem = { id: string; food: { id: string; name: string } };
type Pricing = { halfPortionPrice: number; fullPortionPrice: number };
type PortionType = "HALF" | "FULL";

type DaySelection = {
    date: string; // YYYY-MM-DD
    menuItemId: string | null;
    portionType: PortionType | null;
    availableMenuItems: MenuItem[] | null; // null = not yet loaded
};

type Phase = "child" | "days" | "food" | "summary";

function toDateParam(date: Date): string {
    return date.toISOString().split("T")[0];
}

export default function DailyReservationPage() {
    const router = useRouter();
    const [phase, setPhase] = useState<Phase>("child");

    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    const [selectableDates, setSelectableDates] = useState<Set<string>>(
        new Set()
    );
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [daySelections, setDaySelections] = useState<DaySelection[]>([]);
    const [pricing, setPricing] = useState<Pricing | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch("/api/children")
            .then((res) => res.json())
            .then((data) => data.success && setChildren(data.children));
    }, []);

    async function goToDaysPhase() {
        const res = await fetch("/api/reservations/daily/available-days");
        const data = await res.json();
        if (data.success) {
            setSelectableDates(new Set(data.selectableDates));
            setPhase("days");
        }
    }

    async function goToFoodPhase() {
        if (selectedDates.length === 0) {
            toast.error("حداقل یک روز را انتخاب کنید");
            return;
        }

        const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());

        setDaySelections(
            sortedDates.map((d) => ({
                date: toDateParam(d),
                menuItemId: null,
                portionType: null,
                availableMenuItems: null,
            }))
        );
        setPhase("food");

        // Load menu + pricing for each selected day
        for (const date of sortedDates) {
            const res = await fetch(`/api/reservations/menu?date=${toDateParam(date)}`);
            const data = await res.json();
            if (data.success) {
                if (!pricing) setPricing(data.pricing);
                setDaySelections((prev) =>
                    prev.map((ds) =>
                        ds.date === toDateParam(date)
                            ? { ...ds, availableMenuItems: data.menuItems }
                            : ds
                    )
                );
            }
        }
    }

    function updateDaySelection(
        date: string,
        menuItemId: string,
        portionType: PortionType
    ) {
        setDaySelections((prev) =>
            prev.map((ds) => (ds.date === date ? { ...ds, menuItemId, portionType } : ds))
        );
    }

    function goToSummary() {
        const incomplete = daySelections.some(
            (ds) => !ds.menuItemId || !ds.portionType
        );
        if (incomplete) {
            toast.error("برای همه روزها غذا انتخاب کنید");
            return;
        }
        setPhase("summary");
    }

    function calculateItemPrice(portionType: PortionType): number {
        if (!pricing) return 0;
        return portionType === "HALF" ? pricing.halfPortionPrice : pricing.fullPortionPrice;
    }

    const totalAmount = daySelections.reduce(
        (sum, ds) => sum + (ds.portionType ? calculateItemPrice(ds.portionType) : 0),
        0
    );

    async function handleSubmitOrder() {
        if (!selectedChildId) return;
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/reservations/daily", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    childId: selectedChildId,
                    items: daySelections.map((ds) => ({
                        date: ds.date,
                        menuItemId: ds.menuItemId,
                        portionType: ds.portionType,
                    })),
                }),
            });
            const data = await res.json();
            if (!data.success) {
                toast.error(data.error);
                return;
            }
            toast.success("سفارش ثبت شد، در حال انتقال به درگاه پرداخت...");
            // Step 8 will wire this to the real Zarinpal redirect.
            router.push(`/dashboard/orders/${data.orderId}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    const selectedChild = children.find((c) => c.id === selectedChildId);

    return (
        <div className="flex flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-xl">
                <CardHeader>
                    <CardTitle>رزرو غذای روزانه</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {phase === "child" && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                این رزرو برای کدام فرزند است؟
                            </p>
                            <div className="flex flex-col gap-2">
                                {children.map((child) => (
                                    <button
                                        key={child.id}
                                        type="button"
                                        onClick={() => setSelectedChildId(child.id)}
                                        className={`border rounded-md p-3 text-sm text-right ${selectedChildId === child.id ? "border-primary" : ""
                                            }`}
                                    >
                                        <div className="font-medium">
                                            {child.firstName} {child.lastName}
                                        </div>
                                        <div className="text-muted-foreground">
                                            {child.school.name} — {child.grade.name}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <Button disabled={!selectedChildId} onClick={goToDaysPhase}>
                                ادامه
                            </Button>
                        </>
                    )}

                    {phase === "days" && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                روزهای مورد نظر را انتخاب کنید (فقط روزهای قابل رزرو فعال هستند)
                            </p>
                            <Calendar
                                mode="multiple"
                                selected={selectedDates}
                                onSelect={(dates) => setSelectedDates(dates ?? [])}
                                disabled={(date) => !selectableDates.has(toDateParam(date))}
                            />
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setPhase("child")}>
                                    بازگشت
                                </Button>
                                <Button onClick={goToFoodPhase}>ادامه</Button>
                            </div>
                        </>
                    )}

                    {phase === "food" && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                برای هر روز، غذا و سایز پرس را انتخاب کنید
                            </p>
                            {daySelections.map((ds) => (
                                <div key={ds.date} className="border rounded-md p-3">
                                    <div className="font-medium mb-2">{ds.date}</div>
                                    {ds.availableMenuItems === null && (
                                        <p className="text-sm text-muted-foreground">
                                            در حال بارگذاری...
                                        </p>
                                    )}
                                    {ds.availableMenuItems?.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            برای این روز غذایی تعریف نشده است.
                                        </p>
                                    )}
                                    {ds.availableMenuItems?.map((mi) => (
                                        <div key={mi.id} className="flex items-center gap-2 mb-1">
                                            <span className="flex-1 text-sm">{mi.food.name}</span>
                                            <Button
                                                size="sm"
                                                variant={
                                                    ds.menuItemId === mi.id && ds.portionType === "HALF"
                                                        ? "default"
                                                        : "outline"
                                                }
                                                onClick={() => updateDaySelection(ds.date, mi.id, "HALF")}
                                            >
                                                نیم پرس ({pricing?.halfPortionPrice.toLocaleString()} تومن)
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={
                                                    ds.menuItemId === mi.id && ds.portionType === "FULL"
                                                        ? "default"
                                                        : "outline"
                                                }
                                                onClick={() => updateDaySelection(ds.date, mi.id, "FULL")}
                                            >
                                                تمام پرس ({pricing?.fullPortionPrice.toLocaleString()} تومن)
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setPhase("days")}>
                                    بازگشت
                                </Button>
                                <Button onClick={goToSummary}>ادامه به خلاصه سفارش</Button>
                            </div>
                        </>
                    )}

                    {phase === "summary" && (
                        <>
                            <p className="text-sm">
                                فرزند: {selectedChild?.firstName} {selectedChild?.lastName}
                            </p>
                            <div className="flex flex-col gap-2">
                                {daySelections.map((ds) => {
                                    const food = ds.availableMenuItems?.find(
                                        (mi) => mi.id === ds.menuItemId
                                    );
                                    return (
                                        <div
                                            key={ds.date}
                                            className="flex justify-between border-b pb-1 text-sm"
                                        >
                                            <span>
                                                {ds.date} — {food?.food.name} (
                                                {ds.portionType === "HALF" ? "نیم پرس" : "تمام پرس"})
                                            </span>
                                            <span>
                                                {ds.portionType &&
                                                    calculateItemPrice(ds.portionType).toLocaleString()}{" "}
                                                تومن
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between font-bold pt-2">
                                <span>مبلغ قابل پرداخت</span>
                                <span>{totalAmount.toLocaleString()} تومن</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setPhase("food")}>
                                    بازگشت
                                </Button>
                                <Button disabled={isSubmitting} onClick={handleSubmitOrder}>
                                    پرداخت و ثبت نهایی
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}