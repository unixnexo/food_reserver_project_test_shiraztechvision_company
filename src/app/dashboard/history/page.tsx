// src/app/dashboard/history/page.tsx
//
// PAGE PURPOSE (for AI agents / future readers):
// Parent's own reservation/order history, sourced from
// GET /api/reports/my-reservations (already calendar-ready: one row per
// reserved day, across all children and orders). This page groups those
// rows by date for a simple list view — the eventual design pass should
// feed the SAME API response directly into a Persian calendar component
// instead of this grouped-list rendering; no API changes needed for that
// swap.

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Reservation = {
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

const STATUS_LABELS: Record<Reservation["orderStatus"], string> = {
    PENDING: "در انتظار پرداخت",
    PAID: "پرداخت شده",
    FAILED: "ناموفق",
};

export default function HistoryPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/reports/my-reservations")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setReservations(data.reservations);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const groupedByDate = reservations.reduce<Record<string, Reservation[]>>(
        (groups, r) => {
            (groups[r.date] ??= []).push(r);
            return groups;
        },
        {}
    );

    const dates = Object.keys(groupedByDate).sort();

    return (
        <div className="p-4 max-w-2xl mx-auto w-full flex flex-col gap-4">
            <h1 className="text-lg font-bold">تاریخچه رزروها</h1>

            {isLoading && <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>}

            {!isLoading && dates.length === 0 && (
                <p className="text-sm text-muted-foreground">هنوز رزروی ثبت نشده است.</p>
            )}

            {dates.map((date) => (
                <Card key={date}>
                    <CardHeader>
                        <CardTitle className="text-sm">{date}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        {groupedByDate[date].map((r, index) => (
                            <div
                                key={`${r.orderId}-${index}`}
                                className="flex justify-between items-center border-b pb-2 text-sm last:border-b-0 last:pb-0"
                            >
                                <div>
                                    <div className="font-medium">{r.childName}</div>
                                    <div className="text-muted-foreground">
                                        {r.foodName} ({r.portionType === "HALF" ? "نیم پرس" : "تمام پرس"})
                                    </div>
                                </div>
                                <div className="text-left">
                                    <div>{r.amount.toLocaleString()} تومن</div>
                                    <div
                                        className={
                                            r.orderStatus === "PAID"
                                                ? "text-green-600"
                                                : r.orderStatus === "FAILED"
                                                    ? "text-red-600"
                                                    : "text-muted-foreground"
                                        }
                                    >
                                        {STATUS_LABELS[r.orderStatus]}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}