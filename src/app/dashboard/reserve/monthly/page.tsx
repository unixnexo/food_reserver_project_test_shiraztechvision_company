"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { ChildPicker } from "@/components/reservation/child-picker";
import { ReservationProgress } from "@/components/reservation/reservation-progress";
import { DayFoodPicker } from "@/components/reservation/day-food-picker";
import { ReservationSummary } from "@/components/reservation/reservation-summary";
import { StickyContinueBar } from "@/components/reservation/sticky-continue-bar";
import { useChildIdParam } from "@/lib/hooks/use-child-id-param";
import { formatPersianDateString } from "@/lib/date/format-persian-date";
import { BackButton } from "@/components/shared/back-button";

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
    date: string;
    menuItemId: string | null;
    portionType: PortionType | null;
    availableMenuItems: MenuItem[] | null;
};

type Phase = "child" | "food" | "summary";

const STEPS = [
    { key: "child", label: "فرزند" },
    { key: "food", label: "غذا" },
    { key: "summary", label: "خلاصه" },
];

function MonthlyReservationInner() {
    const router = useRouter();
    const childIdFromUrl = useChildIdParam();

    // const [phase, setPhase] = useState<Phase>(childIdFromUrl ? "food" : "child");
    const [phase, setPhase] = useState<Phase>("child");

    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(
        childIdFromUrl
    );

    const [monthRange, setMonthRange] = useState<{ start: string; end: string } | null>(
        null
    );
    const [daySelections, setDaySelections] = useState<DaySelection[]>([]);
    const [pricing, setPricing] = useState<Pricing | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingDays, setIsLoadingDays] = useState(false);

    const hasAutoStarted = useRef(false);

    useEffect(() => {
        if (childIdFromUrl && !hasAutoStarted.current) {
            hasAutoStarted.current = true;
            goToFoodPhase();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [childIdFromUrl]);

    useEffect(() => {
        fetch("/api/children")
            .then((res) => res.json())
            .then((data) => data.success && setChildren(data.children));
    }, []);

    useEffect(() => {
        if (childIdFromUrl) {
            goToFoodPhase();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [childIdFromUrl]);

    const hasShownExistingToast = useRef(false);

    async function goToFoodPhase() {
        if (!selectedChildId) return;

        setIsLoadingDays(true);
        try {
            const existingRes = await fetch(
                `/api/reservations/monthly/existing?childId=${selectedChildId}`
            );
            const existingData = await existingRes.json();

            if (!existingData.success) {
                toast.dismiss();
                toast.error(existingData.error ?? "خطایی رخ داد");
                setPhase("child");
                return;
            }

            if (existingData.hasExistingReservation) {
                toast.dismiss();
                toast.error("شما قبلا برای این فرزند در ماه آینده رزرو کرده‌اید");
                setPhase("child");
                return;
            }

            const res = await fetch("/api/reservations/monthly/school-days");
            const data = await res.json();
            if (!data.success) {
                toast.dismiss();
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
                            ds.date === date
                                ? { ...ds, availableMenuItems: menuData.menuItems }
                                : ds
                        )
                    );
                }
            }
        } finally {
            setIsLoadingDays(false);
        }
    }
    function updateDaySelection(
        date: string,
        menuItemId: string,
        portionType: PortionType
    ) {
        setDaySelections((prev) =>
            prev.map((ds) =>
                ds.date === date ? { ...ds, menuItemId, portionType } : ds
            )
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
        return portionType === "HALF"
            ? pricing.halfPortionPrice
            : pricing.fullPortionPrice;
    }

    const totalAmount = daySelections.reduce(
        (sum, ds) =>
            sum + (ds.portionType ? calculateItemPrice(ds.portionType) : 0),
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

            const paymentRes = await fetch("/api/payment/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: data.orderId }),
            });
            const paymentData = await paymentRes.json();

            if (!paymentData.success) {
                toast.error(paymentData.error ?? "خطا در اتصال به درگاه پرداخت");
                router.push(`/dashboard/orders/${data.orderId}`);
                return;
            }

            window.location.href = paymentData.paymentUrl;
        } finally {
            setIsSubmitting(false);
        }
    }

    const selectedChild = children.find((c) => c.id === selectedChildId);
    const currentStepIndex = STEPS.findIndex((s) => s.key === phase);
    const isFoodComplete = daySelections.every(
        (ds) => ds.menuItemId && ds.portionType
    );

    return (
        <div className="min-h-dvh bg-[#F7F5F0]">
            <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-6 sm:px-6 sm:py-10">
                <div className="mb-6 flex items-center gap-4">
                    <BackButton
                        onClick={
                            phase === "child"
                                ? undefined
                                : () => {
                                    if (phase === "food") setPhase("child");
                                    else if (phase === "summary") setPhase("food");
                                }
                        }
                    />

                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold sm:text-xl">رزرو غذای ماهانه</h1>
                    </div>
                </div>

                <ReservationProgress steps={STEPS} currentIndex={currentStepIndex} />

                <div className="flex-1">
                    {phase === "child" && (
                        <>
                            <p className="mb-4 text-sm text-muted-foreground">
                                این رزرو ماهانه برای کدام فرزند است؟ شامل تمام روزهای مدرسه
                                در ماه آینده.
                            </p>
                            <ChildPicker
                                children={children}
                                selectedChildId={selectedChildId}
                                onSelect={setSelectedChildId}
                            />
                        </>
                    )}

                    {phase === "food" && (
                        <>
                            {monthRange && (
                                <div className="mb-4 rounded-2xl bg-[#EAF3ED] px-4 py-3 text-sm text-[#183D2B]">
                                    از {formatPersianDateString(monthRange.start)} تا{" "}
                                    {formatPersianDateString(monthRange.end)}
                                </div>
                            )}
                            <p className="mb-4 text-sm text-muted-foreground">
                                برای هر روز، غذا و سایز پرس را انتخاب کنید.
                            </p>
                            <div className="flex flex-col gap-3">
                                {daySelections.map((ds) => (
                                    <DayFoodPicker
                                        key={ds.date}
                                        selection={ds}
                                        pricing={pricing}
                                        onSelect={(menuItemId, portionType) =>
                                            updateDaySelection(ds.date, menuItemId, portionType)
                                        }
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {phase === "summary" && selectedChild && (
                        <ReservationSummary
                            childName={`${selectedChild.firstName} ${selectedChild.lastName}`}
                            daySelections={daySelections}
                            calculateItemPrice={calculateItemPrice}
                            totalAmount={totalAmount}
                        />
                    )}
                </div>

                {phase === "child" && (
                    <StickyContinueBar
                        label={isLoadingDays ? "در حال بارگذاری..." : "ادامه"}
                        onContinue={goToFoodPhase}
                        disabled={!selectedChildId || isLoadingDays}
                        isLoading={isLoadingDays}
                    />
                )}

                {phase === "food" && (
                    <StickyContinueBar
                        label="ادامه به خلاصه سفارش"
                        onContinue={goToSummary}
                        onBack={() => setPhase("child")}
                        disabled={!isFoodComplete}
                    />
                )}

                {phase === "summary" && (
                    <StickyContinueBar
                        label="پرداخت و ثبت نهایی"
                        onContinue={handleSubmitOrder}
                        onBack={() => setPhase("food")}
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                    />
                )}
            </main>
        </div>
    );
}

export default function MonthlyReservationPage() {
    return (
        <Suspense fallback={null}>
            <MonthlyReservationInner />
        </Suspense>
    );
}