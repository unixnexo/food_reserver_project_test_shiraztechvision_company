"use client";

import { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";

import { ReportFilters } from "@/components/admin/reports/report-filters";
import { ReportTable } from "@/components/admin/reports/report-table";
import { Pagination } from "@/components/shared/pagination";

type Option = { id: string; name: string };

type ReportRow = {
    orderItemId: string;
    date: string;
    childName: string;
    schoolName: string;
    gradeName: string;
    foodName: string;
    portionType: "HALF" | "FULL";
    amount: number;
    orderId: string;
    orderType: "DAILY" | "MONTHLY";
    orderStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
    itemStatus: "ACTIVE" | "CANCELLED";
    parentPhone: string;
    orderPlacedAt: string;
};


const PAGE_SIZE = 50;

export default function AdminReportsPage() {
    const [schools, setSchools] = useState<Option[]>([]);
    const [grades, setGrades] = useState<Option[]>([]);
    const [rows, setRows] = useState<ReportRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalPaidAmount, setTotalPaidAmount] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

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

    async function runReport(targetPage: number = 1) {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (schoolId) params.set("schoolId", schoolId);
            if (gradeId) params.set("gradeId", gradeId);
            if (date) params.set("date", date);
            if (orderStatus) params.set("orderStatus", orderStatus);
            if (orderType) params.set("orderType", orderType);
            params.set("page", String(targetPage));
            params.set("pageSize", String(PAGE_SIZE));

            const res = await fetch(`/api/admin/reports?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setRows(data.rows);
                setTotalPaidAmount(data.totalPaidAmount ?? 0);
                setPage(data.pagination.page);
                setTotalPages(data.pagination.totalPages);
                setTotalCount(data.pagination.totalCount);
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        runReport(1);
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
        setPage(1);

        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", "1");
            params.set("pageSize", String(PAGE_SIZE));
            const res = await fetch(`/api/admin/reports?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setRows(data.rows);
                setTotalPaidAmount(data.totalPaidAmount ?? 0);
                setPage(data.pagination.page);
                setTotalPages(data.pagination.totalPages);
                setTotalCount(data.pagination.totalCount);
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mx-auto w-full max-w-6xl">

            <div className="mb-8 overflow-hidden rounded-2xl border border-[#DCE3DE] bg-white shadow-sm">
                <div className="h-1 bg-[#183D2B]" />

                <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]">
                        <ClipboardList className="size-5" />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[#183D2B] sm:text-2xl">
                            گزارش‌ها
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            گزارش کامل سفارش‌های غذای ثبت‌شده در سیستم.
                        </p>
                    </div>
                </div>
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
                    onApply={() => runReport(1)}
                    onClear={handleClear}
                />

                <section className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-base font-semibold">
                            نتایج ({totalCount.toLocaleString("fa-IR")} مورد)
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            جمع پرداخت‌شده: {totalPaidAmount.toLocaleString("fa-IR")} تومان
                        </p>
                    </div>

                    <ReportTable
                        rows={rows}
                        isLoading={isLoading}
                        onCancelled={() => runReport(page)}
                    />

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        pageSize={PAGE_SIZE}
                        isLoading={isLoading}
                        onPageChange={(p) => runReport(p)}
                    />
                </section>
            </div>
        </div>
    );
}