"use client";

import { useState } from "react";
import { Loader2, ReceiptText, X } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatPersianDateString } from "@/lib/date/format-persian-date";
import { AdminCancelReservationDialog } from "./admin-cancel-reservation-dialog";

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

const STATUS_LABELS: Record<ReportRow["orderStatus"], string> = {
    PENDING: "در انتظار پرداخت",
    PAID: "پرداخت شده",
    FAILED: "ناموفق",
    CANCELLED: "لغو شده",
};

const STATUS_STYLES: Record<ReportRow["orderStatus"], string> = {
    PENDING: "bg-amber-50 text-amber-700",
    PAID: "bg-[#EAF3ED] text-[#183D2B]",
    FAILED: "bg-red-50 text-red-700",
    CANCELLED: "bg-muted text-muted-foreground",
};

function formatToman(amount: number): string {
    return `${amount.toLocaleString("fa-IR")} تومان`;
}

function StatusBadge({ status }: { status: ReportRow["orderStatus"] }) {
    return (
        <span
            className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
        >
            {STATUS_LABELS[status]}
        </span>
    );
}

type ReportTableProps = {
    rows: ReportRow[];
    isLoading: boolean;
    onCancelled: () => void;
};

export function ReportTable({ rows, isLoading, onCancelled }: ReportTableProps) {
    const [cancelTarget, setCancelTarget] = useState<ReportRow | null>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="size-6 animate-spin text-[#183D2B]" />
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 px-6 py-14 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                    <ReceiptText className="size-6 text-muted-foreground" />
                </div>

                <h3 className="text-sm font-semibold">موردی یافت نشد</h3>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    فیلترها را تغییر دهید یا آن‌ها را پاک کنید.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Mobile: card list */}
            <div className="flex flex-col gap-3 sm:hidden">
                {rows.map((r, index) => (
                    <div
                        key={`${r.orderId}-${index}`}
                        className="rounded-2xl border border-border/70 p-4"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                    {r.childName}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    {r.schoolName} · {r.gradeName}
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                                <StatusBadge status={r.orderStatus} />

                                {r.itemStatus === "ACTIVE" && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setCancelTarget(r)}
                                        className="size-8 shrink-0 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                                    >
                                        <X className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
                            <div>
                                <p className="text-muted-foreground">تاریخ</p>
                                <p className="mt-0.5 font-medium">
                                    {formatPersianDateString(r.date)}
                                </p>
                            </div>

                            <div>
                                <p className="text-muted-foreground">غذا</p>
                                <p className="mt-0.5 font-medium">{r.foodName}</p>
                            </div>

                            <div>
                                <p className="text-muted-foreground">سایز</p>
                                <p className="mt-0.5 font-medium">
                                    {r.portionType === "HALF" ? "نیم پرس" : "تمام پرس"}
                                </p>
                            </div>

                            <div>
                                <p className="text-muted-foreground">مبلغ</p>
                                <p className="mt-0.5 font-medium">
                                    {formatToman(r.amount)}
                                </p>
                            </div>

                            <div>
                                <p className="text-muted-foreground">نوع سفارش</p>
                                <p className="mt-0.5 font-medium">
                                    {r.orderType === "DAILY" ? "روزانه" : "ماهانه"}
                                </p>
                            </div>

                            <div>
                                <p className="text-muted-foreground">موبایل والدین</p>
                                <p className="mt-0.5 font-medium">
                                    {r.parentPhone}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden overflow-x-auto rounded-2xl border border-border/70 sm:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">تاریخ</TableHead>
                            <TableHead className="text-right">دانش‌آموز</TableHead>
                            <TableHead className="text-right">مدرسه</TableHead>
                            <TableHead className="text-right">مقطع</TableHead>
                            <TableHead className="text-right">غذا</TableHead>
                            <TableHead className="text-right">سایز</TableHead>
                            <TableHead className="text-right">مبلغ</TableHead>
                            <TableHead className="text-right">نوع سفارش</TableHead>
                            <TableHead className="text-right">وضعیت</TableHead>
                            <TableHead className="text-right">موبایل والدین</TableHead>
                            <TableHead className="text-right">زمان ثبت سفارش</TableHead>
                            <TableHead className="text-right">عملیات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((r, index) => (
                            <TableRow key={`${r.orderId}-${index}`}>
                                <TableCell className="whitespace-nowrap">
                                    {formatPersianDateString(r.date)}
                                </TableCell>
                                <TableCell>{r.childName}</TableCell>
                                <TableCell>{r.schoolName}</TableCell>
                                <TableCell>{r.gradeName}</TableCell>
                                <TableCell>{r.foodName}</TableCell>
                                <TableCell>
                                    {r.portionType === "HALF" ? "نیم پرس" : "تمام پرس"}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {formatToman(r.amount)}
                                </TableCell>
                                <TableCell>
                                    {r.orderType === "DAILY" ? "روزانه" : "ماهانه"}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={r.orderStatus} />
                                </TableCell>
                                <TableCell dir="ltr" className="text-right">
                                    {r.parentPhone}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    {formatPersianDateString(r.orderPlacedAt)}
                                </TableCell>
                                <TableCell>
                                    {r.itemStatus === "ACTIVE" && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setCancelTarget(r)}
                                            className="size-9 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AdminCancelReservationDialog
                orderItemId={cancelTarget?.orderItemId ?? null}
                childName={cancelTarget?.childName ?? ""}
                foodName={cancelTarget?.foodName ?? ""}
                amount={cancelTarget?.orderStatus === "PAID" ? (cancelTarget?.amount ?? 0) : 0}
                onClose={() => setCancelTarget(null)}
                onCancelled={onCancelled}
            />
        </>
    );
}