"use client";

import { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";

import { ReportFilters } from "@/components/admin/reports/report-filters";
import { ReportTable } from "@/components/admin/reports/report-table";

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

export default function AdminReportsPage() {
    const [schools, setSchools] = useState<Option[]>([]);
    const [grades, setGrades] = useState<Option[]>([]);
    const [rows, setRows] = useState<ReportRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [schoolId, setSchoolId] = useState("");
    const [gradeId, setGradeId] = useState("");
    const [orderStatus, setOrderStatus] = useState("");
    const [orderType, setOrderType] = useState("");

    const [jy, setJy] = useState<number | null>(null);
    const [jm, setJm] = useState<number | null>(null);
    const [jd, setJd] = useState<number | null>(null);
    const [date, setDate] = useState<string>("");

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

    async function handleClear() {
        setSchoolId("");
        setGradeId("");
        setOrderStatus("");
        setOrderType("");
        setJy(null);
        setJm(null);
        setJd(null);
        setDate("");

        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/reports");
            const data = await res.json();
            if (data.success) setRows(data.rows);
        } finally {
            setIsLoading(false);
        }
    }

    const totalAmount = rows
        .filter((r) => r.orderStatus === "PAID")
        .reduce((sum, r) => sum + r.amount, 0);

    return (
        <div className="mx-auto w-full max-w-6xl">
            <div className="mb-8">
                <div className="mb-2 flex items-center gap-3">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3ED] text-[#183D2B]">
                        <ClipboardList className="size-6" />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        گزارش‌ها
                    </h1>
                </div>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    گزارش کامل سفارش‌های غذای ثبت‌شده در سیستم.
                </p>
            </div>

            <div className="flex flex-col gap-6">
                <ReportFilters
                    schools={schools}
                    grades={grades}
                    schoolId={schoolId}
                    gradeId={gradeId}
                    orderStatus={orderStatus}
                    orderType={orderType}
                    jy={jy}
                    jm={jm}
                    jd={jd}
                    isLoading={isLoading}
                    onSchoolChange={setSchoolId}
                    onGradeChange={setGradeId}
                    onOrderStatusChange={setOrderStatus}
                    onOrderTypeChange={setOrderType}
                    onDateChange={({ jy, jm, jd, gregorian }) => {
                        setJy(jy);
                        setJm(jm);
                        setJd(jd);
                        setDate(gregorian ?? "");
                    }}
                    onApply={runReport}
                    onClear={handleClear}
                />

                <section className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-base font-semibold">
                            نتایج ({rows.length.toLocaleString("fa-IR")} مورد)
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            جمع پرداخت‌شده: {totalAmount.toLocaleString("fa-IR")} تومان
                        </p>
                    </div>

                    <ReportTable rows={rows} isLoading={isLoading} />
                </section>
            </div>
        </div>
    );
}