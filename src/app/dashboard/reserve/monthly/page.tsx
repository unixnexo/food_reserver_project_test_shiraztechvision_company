// src/app/dashboard/reserve/monthly/page.tsx
//
// PAGE PURPOSE (for AI agents / future readers):
// Monthly reservation flow for a logged-in parent. Unlike the daily flow
// (app/dashboard/reserve/daily/page.tsx), there is NO manual day picking —
// every school day in NEXT Jalali month is automatically included (see
// GET /api/reservations/monthly/school-days). Phases:
//
//   Phase "child"   — pick which registered child.
//   Phase "food"    — for EVERY school day in next month (auto-fetched),
//                      pick one food + one portion size.
//   Phase "summary" — shows all selections + computed total, submits to
//                      POST /api/reservations/monthly.
//
// This intentionally mirrors the daily flow's structure closely — the
// underlying order-creation logic is shared (lib/reservation/create-order.ts)
// and only the date-selection mechanism differs.
//
// This is intentionally bare-bones styling — full UI/UX pass happens later.

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
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
    availableMenuItems: MenuItem[] | null;
};

type Phase = "child" | "food" | "summary";

export default function MonthlyReservationPage() {
    const router = useRouter();
    const [phase, setPhase] = useState<Phase>("child");

    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    const [monthRange, setMonthRange] = useState<{ start: string; end: string } | null>(null);
    const [daySelections, setDaySelections] = useState<DaySelection[]>([]);
    const [pricing, setPricing] = useState<Pricing | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch("/api/children")
            .then((res) => res.json())
            .then((data) => data.success && setChildren(data.children));
    }, []);

    async function goToFoodPhase() {
        const res = await fetch("/api/reservations/monthly/school-days");
        const data = await res.json();
        if (!data.success) {
            toast.error("خطا در دریافت روزهای ماه آینده");
            return;
        }

        setMonthRange(data.monthRange);

        const initialSelections: DaySelection[] = data.schoolDays.map(
            (date: string) => ({
                date,
                menuItemId: null,
                portionType: null,
                availableMenuItems: null,
            })
        );
        setDaySelections(initialSelections);
        setPhase("food");

        for (const date of data.schoolDays as string[]) {
            const menuRes = await fetch(`/api/reservations/menu?date=${date}`);
            const menuData = await menuRes.json();
            if (menuData.success) {
                if (!pricing) setPricing(menuData.pricing);
                setDaySelections((prev) =>
                    prev.map((ds) =>
                        ds.date === date ? { ...ds, availableMenuItems: menuData.menuItems } : ds
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
            const res = await fetch("/api/reservations/monthly", {
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
                    <CardTitle>رزرو غذای ماهانه</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {phase === "child" && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                این رزرو ماهانه برای کدام فرزند است؟ (شامل تمام روزهای مدرسه
                                در ماه آینده)
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
                            <Button disabled={!selectedChildId} onClick={goToFoodPhase}>
                                ادامه
                            </Button>
                        </>
                    )}

                    {phase === "food" && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                {monthRange && `از ${monthRange.start} تا ${monthRange.end}`} —
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
                                <Button variant="ghost" onClick={() => setPhase("child")}>
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
                            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
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