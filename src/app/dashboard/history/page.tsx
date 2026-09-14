// "use client";

// import { useEffect, useState } from "react";

// import { HistoryHeader } from "@/components/dashboard/history/history-header";
// import { ReservationHistoryList } from "@/components/dashboard/history/reservation-history-list";
// import { ReservationHistoryEmpty } from "@/components/dashboard/history/reservation-history-empty";
// import { ReservationHistorySkeleton } from "@/components/dashboard/history/reservation-history-skeleton";
// import { BackButton } from "@/components/shared/back-button";
// import { Pagination } from "@/components/shared/pagination";

// export type Reservation = {
//     orderItemId: string;
//     date: string;
//     childId: string;
//     childName: string;
//     foodName: string;
//     portionType: "HALF" | "FULL";
//     amount: number;
//     orderId: string;
//     orderType: "DAILY" | "MONTHLY";
//     orderStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
//     itemStatus: "ACTIVE" | "CANCELLED";
//     orderPlacedAt: string;
//     canCancel: boolean;
//     canEdit: boolean;
// };

// const PAGE_SIZE = 20;

// export default function HistoryPage() {
//     const [reservations, setReservations] = useState<Reservation[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [hasError, setHasError] = useState(false);
//     const [page, setPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);
//     const [totalCount, setTotalCount] = useState(0);

//     async function loadReservations(targetPage: number) {
//         try {
//             setIsLoading(true);

//             const params = new URLSearchParams();
//             params.set("page", String(targetPage));
//             params.set("pageSize", String(PAGE_SIZE));

//             const res = await fetch(
//                 `/api/reports/my-reservations?${params.toString()}`
//             );

//             if (!res.ok) {
//                 throw new Error("Failed to fetch reservations");
//             }

//             const data = await res.json();

//             if (data.success) {
//                 setReservations(data.reservations);
//                 setPage(data.pagination.page);
//                 setTotalPages(data.pagination.totalPages);
//                 setTotalCount(data.pagination.totalCount);
//             } else {
//                 throw new Error("Failed to load reservations");
//             }
//         } catch {
//             setHasError(true);
//         } finally {
//             setIsLoading(false);
//         }
//     }

//     useEffect(() => {
//         loadReservations(1);
//     }, []);

//     return (
//         <div className="min-h-dvh bg-[#F7F5F0]" dir="rtl">
//             {/* <HistoryHeader /> */}

//             <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
//                 <div className="mb-6 sm:mb-8">

//                     <div className="mb-2 flex items-center gap-3">
//                         <BackButton />
//                         <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
//                             تاریخچه رزروها
//                         </h1>
//                     </div>

//                     <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
//                         رزروهای غذایی فرزندانت را اینجا ببین.
//                     </p>
//                 </div>

//                 {isLoading ? (
//                     <ReservationHistorySkeleton />
//                 ) : hasError ? (
//                     <div className="rounded-3xl border border-red-200 bg-background px-5 py-10 text-center">
//                         <p className="text-sm text-red-600">
//                             دریافت تاریخچه رزروها با خطا مواجه شد.
//                         </p>
//                     </div>
//                 ) : reservations.length === 0 ? (
//                     <ReservationHistoryEmpty />
//                 ) : (
//                     <>
//                         <ReservationHistoryList
//                             reservations={reservations}
//                             onCancelled={() => loadReservations(page)}
//                         />

//                         <Pagination
//                             page={page}
//                             totalPages={totalPages}
//                             totalCount={totalCount}
//                             pageSize={PAGE_SIZE}
//                             isLoading={isLoading}
//                             onPageChange={(p) => loadReservations(p)}
//                         />
//                     </>
//                 )}
//             </main>
//         </div>
//     );
// }









"use client";

import { useEffect, useState } from "react";

import { HistoryHeader } from "@/components/dashboard/history/history-header";
import { ReservationHistoryList } from "@/components/dashboard/history/reservation-history-list";
import { ReservationHistoryEmpty } from "@/components/dashboard/history/reservation-history-empty";
import { ReservationHistorySkeleton } from "@/components/dashboard/history/reservation-history-skeleton";
import { BackButton } from "@/components/shared/back-button";
import { Pagination } from "@/components/shared/pagination";

export type Reservation = {
    orderItemId: string;
    date: string;
    childId: string;
    childName: string;
    foodName: string;
    portionType: "HALF" | "FULL";
    amount: number;
    note: string | null;
    orderId: string;
    orderType: "DAILY" | "MONTHLY";
    orderStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
    itemStatus: "ACTIVE" | "CANCELLED";
    orderPlacedAt: string;
    canCancel: boolean;
    canEdit: boolean;
};

const PAGE_SIZE = 20;

export default function HistoryPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    async function loadReservations(targetPage: number) {
        try {
            setIsLoading(true);

            const params = new URLSearchParams();
            params.set("page", String(targetPage));
            params.set("pageSize", String(PAGE_SIZE));

            const res = await fetch(
                `/api/reports/my-reservations?${params.toString()}`
            );

            if (!res.ok) {
                throw new Error("Failed to fetch reservations");
            }

            const data = await res.json();

            if (data.success) {
                setReservations(data.reservations);
                setPage(data.pagination.page);
                setTotalPages(data.pagination.totalPages);
                setTotalCount(data.pagination.totalCount);
            } else {
                throw new Error("Failed to load reservations");
            }
        } catch {
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadReservations(1);
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
                    <>
                        <ReservationHistoryList
                            reservations={reservations}
                            onCancelled={() => loadReservations(page)}
                        />

                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            totalCount={totalCount}
                            pageSize={PAGE_SIZE}
                            isLoading={isLoading}
                            onPageChange={(p) => loadReservations(p)}
                        />
                    </>
                )}
            </main>
        </div>
    );
}
