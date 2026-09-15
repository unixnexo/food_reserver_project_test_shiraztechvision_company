"use client";

import { useEffect, useState } from "react";
import { ChefHat, Loader2, Printer } from "lucide-react";
import toast from "react-hot-toast";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { JalaliDateSelect } from "@/components/admin/reports/jalali-date-select";
import { getCurrentJalaliYear } from "@/lib/date/jalali-select-options";
import { formatPersianDateString } from "@/lib/date/format-persian-date";

type School = { id: string; name: string };

type ReportRow = {
    childName: string;
    gradeName: string;
    portionType: "HALF" | "FULL";
    note: string | null;
};

type ReportData = {
    schoolName: string;
    date: string;
    rows: ReportRow[];
    totals: { half: number; full: number };
};

export default function AdminKitchenReportPage() {
    const [schools, setSchools] = useState<School[]>([]);
    const [schoolId, setSchoolId] = useState("");

    const [jy, setJy] = useState<number | null>(getCurrentJalaliYear());
    const [jm, setJm] = useState<number | null>(null);
    const [jd, setJd] = useState<number | null>(null);
    const [date, setDate] = useState<string>("");

    const [report, setReport] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetch("/api/schools")
            .then((res) => res.json())
            .then((data) => data.success && setSchools(data.schools));
    }, []);

    async function handleGenerate() {
        if (!schoolId || !date) {
            toast.error("مدرسه و تاریخ را انتخاب کنید");
            return;
        }

        setIsLoading(true);
        setReport(null);

        try {
            const params = new URLSearchParams({ schoolId, date });
            const res = await fetch(`/api/admin/kitchen-report?${params.toString()}`);
            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "خطا در دریافت گزارش");
                return;
            }

            setReport(data);
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mx-auto w-full max-w-4xl">
            {/* Filters — hidden when printing */}
            <div className="print:hidden">
                <div className="mb-8 overflow-hidden rounded-2xl border border-[#DCE3DE] bg-white shadow-sm">
                    <div className="h-1 bg-[#183D2B]" />

                    <div className="flex items-center gap-4 px-5 py-5 sm:px-6">

                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]">
                            <ChefHat className="size-5" />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-[#183D2B] sm:text-2xl">
                                گزارش آشپزخانه
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                لیست غذای یک مدرسه در یک روز مشخص، قابل چاپ برای آشپزخانه.
                            </p>
                        </div>
                    </div>
                </div>

                <section className="mb-6 rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                مدرسه
                            </label>
                            <Select
                                value={schoolId}
                                onValueChange={(value) => setSchoolId(value ?? "")}
                            >
                                <SelectTrigger className="h-11 w-full rounded-xl">
                                    <SelectValue placeholder="انتخاب مدرسه" />
                                </SelectTrigger>
                                <SelectContent>
                                    {schools.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                تاریخ
                            </label>
                            <JalaliDateSelect
                                jy={jy}
                                jm={jm}
                                jd={jd}
                                onChange={({ jy, jm, jd, gregorian }) => {
                                    setJy(jy);
                                    setJm(jm);
                                    setJd(jd);
                                    setDate(gregorian ?? "");
                                }}
                            />
                        </div>
                    </div>

                    <Button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isLoading || !schoolId || !date}
                        className="mt-5 h-11 w-full rounded-2xl bg-[#183D2B] text-white hover:bg-[#24543C] sm:w-auto"
                    >
                        {isLoading && <Loader2 className="size-4 animate-spin" />}
                        نمایش گزارش
                    </Button>
                </section>

                {report && (
                    <div className="mb-6 flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.print()}
                            className="h-11 rounded-2xl"
                        >
                            <Printer className="size-4" />
                            چاپ گزارش
                        </Button>
                    </div>
                )}
            </div>

            {/* Printable report */}
            {report && (
                <section className="rounded-3xl border border-border/70 bg-background p-5 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none sm:p-8">
                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-bold">{report.schoolName}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {formatPersianDateString(report.date)}
                        </p>
                    </div>

                    {report.rows.length === 0 ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">
                            برای این مدرسه در این تاریخ سفارشی ثبت نشده است.
                        </p>
                    ) : (
                        <>
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b-2 border-foreground/20">
                                        <th className="px-2 py-2.5 text-right font-semibold">
                                            ردیف
                                        </th>
                                        <th className="px-2 py-2.5 text-right font-semibold">
                                            نام و نام خانوادگی
                                        </th>
                                        <th className="px-2 py-2.5 text-right font-semibold">
                                            پایه
                                        </th>
                                        <th className="px-2 py-2.5 text-center font-semibold">
                                            نیم پرس
                                        </th>
                                        <th className="px-2 py-2.5 text-center font-semibold">
                                            تمام پرس
                                        </th>
                                        <th className="px-2 py-2.5 text-right font-semibold">
                                            توضیحات
                                        </th>
                                        <th className="px-2 py-2.5 text-right font-semibold">
                                            آشپزخانه
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.rows.map((row, index) => (
                                        <tr
                                            key={index}
                                            className="border-b border-border/50"
                                        >
                                            <td className="px-2 py-2 text-right tabular-nums">
                                                {(index + 1).toLocaleString("fa-IR")}
                                            </td>
                                            <td className="px-2 py-2 text-right">
                                                {row.childName}
                                            </td>
                                            <td className="px-2 py-2 text-right">
                                                {row.gradeName}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                {row.portionType === "HALF" ? "✓" : ""}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                {row.portionType === "FULL" ? "✓" : ""}
                                            </td>
                                            <td className="px-2 py-2 text-right text-muted-foreground">
                                                {row.note ?? ""}
                                            </td>
                                            <td className="px-2 py-2"></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-6 flex justify-end gap-8 border-t border-foreground/20 pt-4 text-sm font-medium">
                                <p>
                                    نیم پرس: {report.totals.half.toLocaleString("fa-IR")}
                                </p>
                                <p>
                                    تمام پرس: {report.totals.full.toLocaleString("fa-IR")}
                                </p>
                                <p>
                                    جمع کل:{" "}
                                    {(report.totals.half + report.totals.full).toLocaleString(
                                        "fa-IR"
                                    )}
                                </p>
                            </div>
                        </>
                    )}
                </section>
            )}

            <style>{`
                @media print {
                    @page {
                        margin: 1.5cm;
                    }
                    body {
                        background: white !important;
                    }
                }
            `}</style>
        </div>
    );
}