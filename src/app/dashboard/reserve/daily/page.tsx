// "use client";

// import { useState, useEffect, Suspense } from "react";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";

// import { Calendar } from "@/components/ui/calendar";
// import { ChildPicker } from "@/components/reservation/child-picker";
// import { ReservationProgress } from "@/components/reservation/reservation-progress";
// import { DayFoodPicker } from "@/components/reservation/day-food-picker";
// import { ReservationSummary } from "@/components/reservation/reservation-summary";
// import { StickyContinueBar } from "@/components/reservation/sticky-continue-bar";
// import { useChildIdParam } from "@/lib/hooks/use-child-id-param";
// import { BackButton } from "@/components/shared/back-button";
// import { toDateParam } from "@/lib/date/normalize";
// import { CalendarDayButton } from "@/components/ui/calendar";
// import { BookedDayPopover } from "@/components/reservation/booked-day-popover";

// type Child = {
//     id: string;
//     firstName: string;
//     lastName: string;
//     school: { name: string };
//     grade: { name: string };
// };

// type MenuItem = { id: string; food: { id: string; name: string } };
// type Pricing = { halfPortionPrice: number; fullPortionPrice: number };
// type PortionType = "HALF" | "FULL";

// type DaySelection = {
//     date: string;
//     menuItemId: string | null;
//     portionType: PortionType | null;
//     availableMenuItems: MenuItem[] | null;
// };

// type Phase = "child" | "days" | "food" | "summary";

// const STEPS = [
//     { key: "child", label: "فرزند" },
//     { key: "days", label: "روزها" },
//     { key: "food", label: "غذا" },
//     { key: "summary", label: "خلاصه" },
// ];


// function DailyReservationInner() {
//     const router = useRouter();
//     const childIdFromUrl = useChildIdParam();

//     const [phase, setPhase] = useState<Phase>(childIdFromUrl ? "days" : "child");

//     const [children, setChildren] = useState<Child[]>([]);
//     const [selectedChildId, setSelectedChildId] = useState<string | null>(
//         childIdFromUrl
//     );

//     const [selectableDates, setSelectableDates] = useState<Set<string>>(
//         new Set()
//     );
//     const [selectedDates, setSelectedDates] = useState<Date[]>([]);
//     const [daySelections, setDaySelections] = useState<DaySelection[]>([]);
//     const [pricing, setPricing] = useState<Pricing | null>(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isLoadingDays, setIsLoadingDays] = useState(false);
//     const [offDates, setOffDates] = useState<Set<string>>(new Set());
//     const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

//     useEffect(() => {
//         fetch("/api/children")
//             .then((res) => res.json())
//             .then((data) => data.success && setChildren(data.children));
//     }, []);

//     useEffect(() => {
//         if (childIdFromUrl) {
//             goToDaysPhase();
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [childIdFromUrl]);

//     async function goToDaysPhase() {
//         if (!selectedChildId) return;

//         setIsLoadingDays(true);
//         try {
//             const [availableRes, bookedRes] = await Promise.all([
//                 fetch("/api/reservations/daily/available-days"),
//                 fetch(
//                     `/api/reservations/daily/booked-dates?childId=${selectedChildId}`
//                 ),
//             ]);

//             const availableData = await availableRes.json();
//             const bookedData = await bookedRes.json();

//             if (availableData.success) {
//                 setSelectableDates(new Set(availableData.selectableDates));
//                 setOffDates(new Set(availableData.offDates));
//             }

//             if (bookedData.success) {
//                 setBookedDates(new Set(bookedData.bookedDates));
//             }

//             setPhase("days");
//         } finally {
//             setIsLoadingDays(false);
//         }
//     }

//     async function goToFoodPhase() {
//         if (selectedDates.length === 0) {
//             toast.error("حداقل یک روز را انتخاب کنید");
//             return;
//         }

//         const sortedDates = [...selectedDates].sort(
//             (a, b) => a.getTime() - b.getTime()
//         );

//         setDaySelections(
//             sortedDates.map((d) => ({
//                 date: toDateParam(d),
//                 menuItemId: null,
//                 portionType: null,
//                 availableMenuItems: null,
//             }))
//         );
//         setPhase("food");

//         for (const date of sortedDates) {
//             const res = await fetch(
//                 `/api/reservations/menu?date=${toDateParam(date)}`
//             );
//             const data = await res.json();
//             if (data.success) {
//                 if (!pricing) setPricing(data.pricing);
//                 setDaySelections((prev) =>
//                     prev.map((ds) =>
//                         ds.date === toDateParam(date)
//                             ? { ...ds, availableMenuItems: data.menuItems }
//                             : ds
//                     )
//                 );
//             }
//         }
//     }

//     function updateDaySelection(
//         date: string,
//         menuItemId: string,
//         portionType: PortionType
//     ) {
//         setDaySelections((prev) =>
//             prev.map((ds) =>
//                 ds.date === date ? { ...ds, menuItemId, portionType } : ds
//             )
//         );
//     }

//     function goToSummary() {
//         const incomplete = daySelections.some(
//             (ds) => !ds.menuItemId || !ds.portionType
//         );
//         if (incomplete) {
//             toast.error("برای همه روزها غذا انتخاب کنید");
//             return;
//         }
//         setPhase("summary");
//     }

//     function calculateItemPrice(portionType: PortionType): number {
//         if (!pricing) return 0;
//         return portionType === "HALF"
//             ? pricing.halfPortionPrice
//             : pricing.fullPortionPrice;
//     }

//     const totalAmount = daySelections.reduce(
//         (sum, ds) =>
//             sum + (ds.portionType ? calculateItemPrice(ds.portionType) : 0),
//         0
//     );

//     async function handleSubmitOrder() {
//         if (!selectedChildId) return;
//         setIsSubmitting(true);
//         try {
//             const res = await fetch("/api/reservations/daily", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     childId: selectedChildId,
//                     items: daySelections.map((ds) => ({
//                         date: ds.date,
//                         menuItemId: ds.menuItemId,
//                         portionType: ds.portionType,
//                     })),
//                 }),
//             });
//             const data = await res.json();
//             if (!data.success) {
//                 toast.error(data.error);
//                 return;
//             }

//             const paymentRes = await fetch("/api/payment/request", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ orderId: data.orderId }),
//             });
//             const paymentData = await paymentRes.json();

//             if (!paymentData.success) {
//                 toast.error(paymentData.error ?? "خطا در اتصال به درگاه پرداخت");
//                 router.push(`/dashboard/orders/${data.orderId}`);
//                 return;
//             }

//             window.location.href = paymentData.paymentUrl;
//         } finally {
//             setIsSubmitting(false);
//         }
//     }

//     const selectedChild = children.find((c) => c.id === selectedChildId);
//     const currentStepIndex = STEPS.findIndex((s) => s.key === phase);
//     const isFoodComplete = daySelections.every(
//         (ds) => ds.menuItemId && ds.portionType
//     );

//     return (
//         <div className="min-h-dvh bg-[#F7F5F0]">
//             <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-6 sm:px-6 sm:py-10">
//                 <div className="mb-6 flex items-center gap-4">
//                     <BackButton
//                         onClick={
//                             phase === "child"
//                                 ? undefined
//                                 : () => {
//                                     if (phase === "days") setPhase("child");
//                                     else if (phase === "food") setPhase("days");
//                                     else if (phase === "summary") setPhase("food");
//                                 }
//                         }
//                     />

//                     <div className="flex items-center gap-3">
//                         <h1 className="text-lg font-bold sm:text-xl">رزرو غذای روزانه</h1>
//                     </div>
//                 </div>

//                 <ReservationProgress steps={STEPS} currentIndex={currentStepIndex} />

//                 <div className="flex-1">
//                     {phase === "child" && (
//                         <>
//                             <p className="mb-4 text-sm text-muted-foreground">
//                                 این رزرو برای کدام فرزند است؟
//                             </p>
//                             <ChildPicker
//                                 children={children}
//                                 selectedChildId={selectedChildId}
//                                 onSelect={setSelectedChildId}
//                             />
//                         </>
//                     )}

//                     {phase === "days" && (
//                         <>
//                             <p className="mb-3 text-sm text-muted-foreground">
//                                 روزهای مورد نظر را انتخاب کنید. فقط روزهای قابل رزرو فعال
//                                 هستند.
//                             </p>

//                             <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
//                                 <div className="flex items-center gap-1.5">
//                                     <span className="size-3 rounded-full bg-red-300" />
//                                     قرمز یعنی تعطیل
//                                 </div>
//                                 <div className="flex items-center gap-1.5">
//                                     <span className="size-3 rounded-full bg-blue-300" />
//                                     آبی یعنی قبلا رزرو کرده‌ای
//                                 </div>
//                                 <div className="flex items-center gap-1.5">
//                                     <span className="size-3 rounded-full bg-muted-foreground" />
//                                     خاکستری یعنی قابل انتخاب نیست
//                                 </div>
//                             </div>

//                             <div className="flex justify-center rounded-3xl border border-border/70 bg-background p-3 shadow-sm sm:p-4">
//                                 {/* <Calendar
//                                     mode="multiple"
//                                     selected={selectedDates}
//                                     onSelect={(dates) => setSelectedDates(dates ?? [])}
//                                     disabled={(date) =>
//                                         !selectableDates.has(toDateParam(date)) ||
//                                         bookedDates.has(toDateParam(date))
//                                     }
//                                     modifiers={{
//                                         offDay: (date) => offDates.has(toDateParam(date)),
//                                         booked: (date) => bookedDates.has(toDateParam(date)),
//                                     }}
//                                 /> */}

//                                 <Calendar
//                                     mode="multiple"
//                                     selected={selectedDates}
//                                     onSelect={(dates) => {
//                                         const filtered = (dates ?? []).filter(
//                                             (d) => !bookedDates.has(toDateParam(d))
//                                         );

//                                         setSelectedDates(filtered);
//                                     }}
//                                     disabled={(date) => {
//                                         const dateParam = toDateParam(date);

//                                         if (bookedDates.has(dateParam)) return false;

//                                         return !selectableDates.has(dateParam);
//                                     }}
//                                     modifiers={{
//                                         offDay: (date) => offDates.has(toDateParam(date)),
//                                         booked: (date) => bookedDates.has(toDateParam(date)),
//                                     }}
//                                     components={{
//                                         DayButton: (props) => {
//                                             const dateParam = toDateParam(props.day.date);
//                                             const isBooked = bookedDates.has(dateParam);

//                                             if (isBooked && selectedChildId) {
//                                                 return (
//                                                     <BookedDayPopover
//                                                         childId={selectedChildId}
//                                                         date={dateParam}
//                                                     >
//                                                         <CalendarDayButton {...props} />
//                                                     </BookedDayPopover>
//                                                 );
//                                             }

//                                             return <CalendarDayButton {...props} />;
//                                         },
//                                     }}
//                                 />

//                             </div>
//                         </>
//                     )}

//                     {phase === "food" && (
//                         <>
//                             <p className="mb-4 text-sm text-muted-foreground">
//                                 برای هر روز، غذا و سایز پرس را انتخاب کنید.
//                             </p>
//                             <div className="flex flex-col gap-3">
//                                 {daySelections.map((ds) => (
//                                     <DayFoodPicker
//                                         key={ds.date}
//                                         selection={ds}
//                                         pricing={pricing}
//                                         onSelect={(menuItemId, portionType) =>
//                                             updateDaySelection(ds.date, menuItemId, portionType)
//                                         }
//                                     />
//                                 ))}
//                             </div>
//                         </>
//                     )}

//                     {phase === "summary" && selectedChild && (
//                         <ReservationSummary
//                             childName={`${selectedChild.firstName} ${selectedChild.lastName}`}
//                             daySelections={daySelections}
//                             calculateItemPrice={calculateItemPrice}
//                             totalAmount={totalAmount}
//                         />
//                     )}
//                 </div>

//                 {phase === "child" && (
//                     <StickyContinueBar
//                         label={isLoadingDays ? "در حال بارگذاری..." : "ادامه"}
//                         onContinue={goToDaysPhase}
//                         disabled={!selectedChildId || isLoadingDays}
//                         isLoading={isLoadingDays}
//                     />
//                 )}

//                 {phase === "days" && (
//                     <StickyContinueBar
//                         label="ادامه"
//                         onContinue={goToFoodPhase}
//                         onBack={() => setPhase("child")}
//                         disabled={selectedDates.length === 0}
//                     />
//                 )}

//                 {phase === "food" && (
//                     <StickyContinueBar
//                         label="ادامه به خلاصه سفارش"
//                         onContinue={goToSummary}
//                         onBack={() => setPhase("days")}
//                         disabled={!isFoodComplete}
//                     />
//                 )}

//                 {phase === "summary" && (
//                     <StickyContinueBar
//                         label="پرداخت و ثبت نهایی"
//                         onContinue={handleSubmitOrder}
//                         onBack={() => setPhase("food")}
//                         disabled={isSubmitting}
//                         isLoading={isSubmitting}
//                     />
//                 )}
//             </main>
//         </div>
//     );
// }

// export default function DailyReservationPage() {
//     return (
//         <Suspense fallback={null}>
//             <DailyReservationInner />
//         </Suspense>
//     );
// }









"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Calendar } from "@/components/ui/calendar";
import { ChildPicker } from "@/components/reservation/child-picker";
import { ReservationProgress } from "@/components/reservation/reservation-progress";
import { DayFoodPicker } from "@/components/reservation/day-food-picker";
import { ReservationSummary } from "@/components/reservation/reservation-summary";
import { StickyContinueBar } from "@/components/reservation/sticky-continue-bar";
import { useChildIdParam } from "@/lib/hooks/use-child-id-param";
import { BackButton } from "@/components/shared/back-button";
import { toDateParam } from "@/lib/date/normalize";
import { CalendarDayButton } from "@/components/ui/calendar";
import { BookedDayPopover } from "@/components/reservation/booked-day-popover";

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

type Phase = "child" | "days" | "food" | "summary";

const STEPS = [
    { key: "child", label: "فرزند" },
    { key: "days", label: "روزها" },
    { key: "food", label: "غذا" },
    { key: "summary", label: "خلاصه" },
];


function DailyReservationInner() {
    const router = useRouter();
    const childIdFromUrl = useChildIdParam();

    const [phase, setPhase] = useState<Phase>(childIdFromUrl ? "days" : "child");

    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(
        childIdFromUrl
    );

    const [selectableDates, setSelectableDates] = useState<Set<string>>(
        new Set()
    );
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [daySelections, setDaySelections] = useState<DaySelection[]>([]);
    const [pricing, setPricing] = useState<Pricing | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingDays, setIsLoadingDays] = useState(false);
    const [offDates, setOffDates] = useState<Set<string>>(new Set());
    const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetch("/api/children")
            .then((res) => res.json())
            .then((data) => data.success && setChildren(data.children));
    }, []);

    useEffect(() => {
        if (childIdFromUrl) {
            goToDaysPhase();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [childIdFromUrl]);

    async function goToDaysPhase() {
        if (!selectedChildId) return;

        setIsLoadingDays(true);
        try {
            const [availableRes, bookedRes] = await Promise.all([
                fetch("/api/reservations/daily/available-days"),
                fetch(
                    `/api/reservations/daily/booked-dates?childId=${selectedChildId}`
                ),
            ]);

            const availableData = await availableRes.json();
            const bookedData = await bookedRes.json();

            if (availableData.success) {
                setSelectableDates(new Set(availableData.selectableDates));
                setOffDates(new Set(availableData.offDates));
            }

            if (bookedData.success) {
                setBookedDates(new Set(bookedData.bookedDates));
            }

            setPhase("days");
        } finally {
            setIsLoadingDays(false);
        }
    }

    async function goToFoodPhase() {
        if (selectedDates.length === 0) {
            toast.error("حداقل یک روز را انتخاب کنید");
            return;
        }

        const sortedDates = [...selectedDates].sort(
            (a, b) => a.getTime() - b.getTime()
        );

        setDaySelections(
            sortedDates.map((d) => ({
                date: toDateParam(d),
                menuItemId: null,
                portionType: null,
                availableMenuItems: null,
            }))
        );
        setPhase("food");

        for (const date of sortedDates) {
            const res = await fetch(
                `/api/reservations/menu?date=${toDateParam(date)}&orderType=DAILY`
            );
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
                                    if (phase === "days") setPhase("child");
                                    else if (phase === "food") setPhase("days");
                                    else if (phase === "summary") setPhase("food");
                                }
                        }
                    />

                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold sm:text-xl">رزرو غذای روزانه</h1>
                    </div>
                </div>

                <ReservationProgress steps={STEPS} currentIndex={currentStepIndex} />

                <div className="flex-1">
                    {phase === "child" && (
                        <>
                            <p className="mb-4 text-sm text-muted-foreground">
                                این رزرو برای کدام فرزند است؟
                            </p>
                            <ChildPicker
                                children={children}
                                selectedChildId={selectedChildId}
                                onSelect={setSelectedChildId}
                            />
                        </>
                    )}

                    {phase === "days" && (
                        <>
                            <p className="mb-3 text-sm text-muted-foreground">
                                روزهای مورد نظر را انتخاب کنید. فقط روزهای قابل رزرو فعال
                                هستند.
                            </p>

                            <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <span className="size-3 rounded-full bg-red-300" />
                                    قرمز یعنی تعطیل
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="size-3 rounded-full bg-blue-300" />
                                    آبی یعنی قبلا رزرو کرده‌ای
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="size-3 rounded-full bg-muted-foreground" />
                                    خاکستری یعنی قابل انتخاب نیست
                                </div>
                            </div>

                            <div className="flex justify-center rounded-3xl border border-border/70 bg-background p-3 shadow-sm sm:p-4">
                                {/* <Calendar
                                    mode="multiple"
                                    selected={selectedDates}
                                    onSelect={(dates) => setSelectedDates(dates ?? [])}
                                    disabled={(date) =>
                                        !selectableDates.has(toDateParam(date)) ||
                                        bookedDates.has(toDateParam(date))
                                    }
                                    modifiers={{
                                        offDay: (date) => offDates.has(toDateParam(date)),
                                        booked: (date) => bookedDates.has(toDateParam(date)),
                                    }}
                                /> */}

                                <Calendar
                                    mode="multiple"
                                    selected={selectedDates}
                                    onSelect={(dates) => {
                                        const filtered = (dates ?? []).filter(
                                            (d) => !bookedDates.has(toDateParam(d))
                                        );

                                        setSelectedDates(filtered);
                                    }}
                                    disabled={(date) => {
                                        const dateParam = toDateParam(date);

                                        if (bookedDates.has(dateParam)) return false;

                                        return !selectableDates.has(dateParam);
                                    }}
                                    modifiers={{
                                        offDay: (date) => offDates.has(toDateParam(date)),
                                        booked: (date) => bookedDates.has(toDateParam(date)),
                                    }}
                                    components={{
                                        DayButton: (props) => {
                                            const dateParam = toDateParam(props.day.date);
                                            const isBooked = bookedDates.has(dateParam);

                                            if (isBooked && selectedChildId) {
                                                return (
                                                    <BookedDayPopover
                                                        childId={selectedChildId}
                                                        date={dateParam}
                                                    >
                                                        <CalendarDayButton {...props} />
                                                    </BookedDayPopover>
                                                );
                                            }

                                            return <CalendarDayButton {...props} />;
                                        },
                                    }}
                                />

                            </div>
                        </>
                    )}

                    {phase === "food" && (
                        <>
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
                        onContinue={goToDaysPhase}
                        disabled={!selectedChildId || isLoadingDays}
                        isLoading={isLoadingDays}
                    />
                )}

                {phase === "days" && (
                    <StickyContinueBar
                        label="ادامه"
                        onContinue={goToFoodPhase}
                        onBack={() => setPhase("child")}
                        disabled={selectedDates.length === 0}
                    />
                )}

                {phase === "food" && (
                    <StickyContinueBar
                        label="ادامه به خلاصه سفارش"
                        onContinue={goToSummary}
                        onBack={() => setPhase("days")}
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

export default function DailyReservationPage() {
    return (
        <Suspense fallback={null}>
            <DailyReservationInner />
        </Suspense>
    );
}
