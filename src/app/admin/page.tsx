// src/app/admin/page.tsx
//
// PAGE PURPOSE (for AI agents / future readers):
// Admin's full system-wide reservation report. Sourced from
// GET /api/admin/reports with filters (school, grade, exact day, Jalali
// month, order status, order type — all combine as AND). Unpaginated by
// design (see route comment). Renders as a flat table — one row per
// reserved meal (OrderItem), not grouped by order.
//
// This is intentionally simple styling — a full UI/UX pass, and possibly
// export/pagination features, come later. Structure and data are the
// priority now.

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Option = { id: string; name: string };

type ReportRow = {
    date: string;
    childName: string;
    schoolName: string;
    gradeName: string;
    foodName: string;
    portionType: "HALF" | "FULL";
    amount: number;
    orderId: string;
    orderType: "DAILY" | "MONTHLY";
    orderStatus: "PENDING" | "PAID" | "FAILED";
    parentPhone: string;
    orderPlacedAt: string;
};

const STATUS_LABELS: Record<ReportRow["orderStatus"], string> = {
    PENDING: "در انتظار پرداخت",
    PAID: "پرداخت شده",
    FAILED: "ناموفق",
};

export default function AdminReportsPage() {
    const [schools, setSchools] = useState<Option[]>([]);
    const [grades, setGrades] = useState<Option[]>([]);
    const [rows, setRows] = useState<ReportRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [schoolId, setSchoolId] = useState("");
    const [gradeId, setGradeId] = useState("");
    const [date, setDate] = useState("");
    const [orderStatus, setOrderStatus] = useState("");
    const [orderType, setOrderType] = useState("");

    useEffect(() => {
        fetch("/api/schools")
            .then((res) => res.json())
            .then((data) => data.success && setSchools(data.schools));
        fetch("/api/grades")
            .then((res) => res.json())
            .then((data) => data.success && setGrades(data.grades));
    }, []);

    async function runReport() {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (schoolId) params.set("schoolId", schoolId);
            if (gradeId) params.set("gradeId", gradeId);
            if (date) params.set("date", date);
            if (orderStatus) params.set("orderStatus", orderStatus);
            if (orderType) params.set("orderType", orderType);

            const res = await fetch(`/api/admin/reports?${params.toString()}`);
            const data = await res.json();
            if (data.success) setRows(data.rows);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        runReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const totalAmount = rows
        .filter((r) => r.orderStatus === "PAID")
        .reduce((sum, r) => sum + r.amount, 0);

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>فیلترها</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <select
                        className="border rounded-md h-9 px-3"
                        value={schoolId}
                        onChange={(e) => setSchoolId(e.target.value)}
                    >
                        <option value="">همه مدارس</option>
                        {schools.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="border rounded-md h-9 px-3"
                        value={gradeId}
                        onChange={(e) => setGradeId(e.target.value)}
                    >
                        <option value="">همه مقاطع</option>
                        {grades.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        className="border rounded-md h-9 px-3"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />

                    <select
                        className="border rounded-md h-9 px-3"
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value)}
                    >
                        <option value="">همه وضعیت‌ها</option>
                        <option value="PENDING">در انتظار پرداخت</option>
                        <option value="PAID">پرداخت شده</option>
                        <option value="FAILED">ناموفق</option>
                    </select>

                    <select
                        className="border rounded-md h-9 px-3"
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                    >
                        <option value="">روزانه و ماهانه</option>
                        <option value="DAILY">روزانه</option>
                        <option value="MONTHLY">ماهانه</option>
                    </select>

                    <Button onClick={runReport} disabled={isLoading}>
                        اعمال فیلتر
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        نتایج ({rows.length} مورد — جمع پرداخت‌شده:{" "}
                        {totalAmount.toLocaleString()} تومن)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>}
                    {!isLoading && rows.length === 0 && (
                        <p className="text-sm text-muted-foreground">موردی یافت نشد.</p>
                    )}
                    {!isLoading && rows.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b text-right">
                                        <th className="p-2">تاریخ</th>
                                        <th className="p-2">دانش‌آموز</th>
                                        <th className="p-2">مدرسه</th>
                                        <th className="p-2">مقطع</th>
                                        <th className="p-2">غذا</th>
                                        <th className="p-2">سایز</th>
                                        <th className="p-2">مبلغ</th>
                                        <th className="p-2">نوع سفارش</th>
                                        <th className="p-2">وضعیت</th>
                                        <th className="p-2">موبایل والدین</th>
                                        <th className="p-2">زمان ثبت سفارش</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r, index) => (
                                        <tr key={`${r.orderId}-${index}`} className="border-b">
                                            <td className="p-2">{r.date}</td>
                                            <td className="p-2">{r.childName}</td>
                                            <td className="p-2">{r.schoolName}</td>
                                            <td className="p-2">{r.gradeName}</td>
                                            <td className="p-2">{r.foodName}</td>
                                            <td className="p-2">
                                                {r.portionType === "HALF" ? "نیم پرس" : "تمام پرس"}
                                            </td>
                                            <td className="p-2">{r.amount.toLocaleString()}</td>
                                            <td className="p-2">
                                                {r.orderType === "DAILY" ? "روزانه" : "ماهانه"}
                                            </td>
                                            <td className="p-2">{STATUS_LABELS[r.orderStatus]}</td>
                                            <td className="p-2" dir="ltr">
                                                {r.parentPhone}
                                            </td>
                                            <td className="p-2" dir="ltr">
                                                {new Date(r.orderPlacedAt).toLocaleString("fa-IR")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}