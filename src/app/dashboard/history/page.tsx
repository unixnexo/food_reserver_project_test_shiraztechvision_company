"use client";

import { useEffect, useState } from "react";

import { HistoryHeader } from "@/components/dashboard/history/history-header";
import { ReservationHistoryList } from "@/components/dashboard/history/reservation-history-list";
import { ReservationHistoryEmpty } from "@/components/dashboard/history/reservation-history-empty";
import { ReservationHistorySkeleton } from "@/components/dashboard/history/reservation-history-skeleton";
import { BackButton } from "@/components/shared/back-button";

export type Reservation = {
    date: string;
    childId: string;
    childName: string;
    foodName: string;
    portionType: "HALF" | "FULL";
    amount: number;
    orderId: string;
    orderType: "DAILY" | "MONTHLY";
    orderStatus: "PENDING" | "PAID" | "FAILED";
    orderPlacedAt: string;
};

export default function HistoryPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        async function loadReservations() {
            try {
                const res = await fetch("/api/reports/my-reservations");

                if (!res.ok) {
                    throw new Error("Failed to fetch reservations");
                }

                const data = await res.json();

                if (data.success) {
                    setReservations(data.reservations);
                } else {
                    throw new Error("Failed to load reservations");
                }
            } catch {
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        }

        loadReservations();
    }, []);

    return (
        <div className="min-h-dvh bg-[#F7F5F0]" dir="rtl">
            {/* <HistoryHeader /> */}

            <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
                <div className="mb-6 sm:mb-8">

                    <div className="mb-2 flex items-center gap-3">
                        <BackButton />
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            تاریخچه رزروها
                        </h1>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                        رزروهای غذایی فرزندانت را اینجا ببین.
                    </p>
                </div>

                {isLoading ? (
                    <ReservationHistorySkeleton />
                ) : hasError ? (
                    <div className="rounded-3xl border border-red-200 bg-background px-5 py-10 text-center">
                        <p className="text-sm text-red-600">
                            دریافت تاریخچه رزروها با خطا مواجه شد.
                        </p>
                    </div>
                ) : reservations.length === 0 ? (
                    <ReservationHistoryEmpty />
                ) : (
                    <ReservationHistoryList reservations={reservations} />
                )}
            </main>
        </div>
    );
}

