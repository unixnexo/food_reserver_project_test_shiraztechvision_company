"use client";

import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { JalaliDateSelect } from "@/components/admin/reports/jalali-date-select";

type Option = { id: string; name: string };

type ReportFiltersProps = {
    schools: Option[];
    grades: Option[];
    schoolId: string;
    gradeId: string;
    orderStatus: string;
    orderType: string;
    jy: number | null;
    jm: number | null;
    jd: number | null;
    isLoading: boolean;
    onSchoolChange: (value: string) => void;
    onGradeChange: (value: string) => void;
    onOrderStatusChange: (value: string) => void;
    onOrderTypeChange: (value: string) => void;
    onDateChange: (params: {
        jy: number | null;
        jm: number | null;
        jd: number | null;
        gregorian: string | null;
    }) => void;
    onApply: () => void;
    onClear: () => void;
};

const ALL = "ALL";

export function ReportFilters({
    schools,
    grades,
    schoolId,
    gradeId,
    orderStatus,
    orderType,
    jy,
    jm,
    jd,
    isLoading,
    onSchoolChange,
    onGradeChange,
    onOrderStatusChange,
    onOrderTypeChange,
    onDateChange,
    onApply,
    onClear,
}: ReportFiltersProps) {
    return (
        <section className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3ED] text-[#183D2B]">
                    <Filter className="size-5" />
                </div>

                <div>
                    <h2 className="text-base font-semibold">فیلترها</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        گزارش را بر اساس معیارهای زیر محدود کنید.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        مدرسه
                    </label>
                    <Select
                        value={schoolId || ALL}
                        onValueChange={(v) => onSchoolChange(v === ALL || v === null ? "" : v)}
                    >
                        <SelectTrigger className="h-11 w-full rounded-xl">
                            <SelectValue placeholder="همه مدارس">
                                {(value: string) =>
                                    schools.find((s) => s.id === value)?.name ?? "همه مدارس"
                                }
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>همه مدارس</SelectItem>
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
                        مقطع
                    </label>
                    <Select
                        value={gradeId || ALL}
                        onValueChange={(v) => onGradeChange(v === ALL || v === null ? "" : v)}
                    >
                        <SelectTrigger className="h-11 w-full rounded-xl">
                            <SelectValue placeholder="همه مقاطع">
                                {(value: string) =>
                                    grades.find((g) => g.id === value)?.name ?? "همه مقاطع"
                                }
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>همه مقاطع</SelectItem>
                            {grades.map((g) => (
                                <SelectItem key={g.id} value={g.id}>
                                    {g.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        وضعیت
                    </label>
                    <Select
                        value={orderStatus || ALL}
                        onValueChange={(v) => onOrderStatusChange(v === ALL || v === null ? "" : v)}
                    >
                        <SelectTrigger className="h-11 w-full rounded-xl">
                            <SelectValue placeholder="همه وضعیت‌ها">
                                {(value: string) => {
                                    const labels: Record<string, string> = {
                                        ALL: "همه وضعیت‌ها",
                                        PENDING: "در انتظار پرداخت",
                                        PAID: "پرداخت شده",
                                        FAILED: "ناموفق",
                                    };
                                    return labels[value] ?? "همه وضعیت‌ها";
                                }}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>همه وضعیت‌ها</SelectItem>
                            <SelectItem value="PENDING">در انتظار پرداخت</SelectItem>
                            <SelectItem value="PAID">پرداخت شده</SelectItem>
                            <SelectItem value="FAILED">ناموفق</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        نوع سفارش
                    </label>
                    <Select
                        value={orderType || ALL}
                        onValueChange={(v) => onOrderTypeChange(v === ALL || v === null ? "" : v)}
                    >
                        <SelectTrigger className="h-11 w-full rounded-xl">
                            <SelectValue placeholder="روزانه و ماهانه">
                                {(value: string) => {
                                    const labels: Record<string, string> = {
                                        ALL: "روزانه و ماهانه",
                                        DAILY: "روزانه",
                                        MONTHLY: "ماهانه",
                                    };
                                    return labels[value] ?? "روزانه و ماهانه";
                                }}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>روزانه و ماهانه</SelectItem>
                            <SelectItem value="DAILY">روزانه</SelectItem>
                            <SelectItem value="MONTHLY">ماهانه</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="sm:col-span-2 lg:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        تاریخ مشخص
                    </label>
                    <JalaliDateSelect
                        jy={jy}
                        jm={jm}
                        jd={jd}
                        onChange={onDateChange}
                    />
                </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:flex-row-reverse sm:items-center sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClear}
                    disabled={isLoading}
                    className="h-11 rounded-xl border-border/70"
                >
                    <X className="size-4" />
                    پاک کردن فیلترها
                </Button>

                <Button
                    type="button"
                    onClick={onApply}
                    disabled={isLoading}
                    className="h-11 rounded-xl bg-[#183D2B] text-white hover:bg-[#24543C]"
                >
                    <Filter className="size-4" />
                    اعمال فیلتر
                </Button>
            </div>
        </section>
    );
}