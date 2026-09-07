// src/app/admin/closed-days/page.tsx
//
// PAGE PURPOSE (for AI agents / future readers):
// "روزهای تعطیل" — admin marks EXTRA closed dates beyond the default
// Thursday/Friday closure (see lib/school-calendar/is-school-day.ts).
// Picking an already-default-closed Thu/Fri is rejected server-side with
// a clear message, since it would be redundant. There is no "reopen a
// Thursday" feature — admin can only add closures, never remove the
// default rule.
//
// DATA FLOW:
// - Calendar picks a date → POST /api/admin/closed-days
// - List of all closures loaded via GET /api/admin/closed-days
// - Each row has a "حذف" (remove) button → DELETE /api/admin/closed-days/[id],
//   which reopens that date as a normal school day.

"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ClosedDay = { id: string; date: string; reason: string | null };

function toDateParam(date: Date): string {
    return date.toISOString().split("T")[0];
}

export default function AdminClosedDaysPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [reason, setReason] = useState("");
    const [closedDays, setClosedDays] = useState<ClosedDay[]>([]);

    async function loadClosedDays() {
        const res = await fetch("/api/admin/closed-days");
        const data = await res.json();
        if (data.success) setClosedDays(data.closedDays);
    }

    useEffect(() => {
        loadClosedDays();
    }, []);

    async function handleAddClosure() {
        if (!selectedDate) return;
        const res = await fetch("/api/admin/closed-days", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date: toDateParam(selectedDate),
                reason: reason.trim() || undefined,
            }),
        });
        const data = await res.json();
        if (!data.success) {
            toast.error(data.error);
            return;
        }
        toast.success("روز مورد نظر تعطیل شد");
        setSelectedDate(undefined);
        setReason("");
        loadClosedDays();
    }

    async function handleRemoveClosure(id: string) {
        const res = await fetch(`/api/admin/closed-days/${id}`, {
            method: "DELETE",
        });
        const data = await res.json();
        if (!data.success) {
            toast.error(data.error);
            return;
        }
        toast.success("روز مجددا باز شد");
        loadClosedDays();
    }

    return (
        <div className="flex flex-wrap gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>افزودن روز تعطیل</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                    />
                    <Input
                        placeholder="دلیل (اختیاری)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <Button onClick={handleAddClosure} disabled={!selectedDate}>
                        ثبت تعطیلی
                    </Button>
                </CardContent>
            </Card>

            <Card className="flex-1 min-w-[300px]">
                <CardHeader>
                    <CardTitle>روزهای تعطیل ثبت شده</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {closedDays.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            هیچ روز تعطیل اضافه‌ای ثبت نشده است.
                        </p>
                    )}
                    {closedDays.map((cd) => (
                        <div
                            key={cd.id}
                            className="flex items-center justify-between border rounded-md p-2 text-sm"
                        >
                            <span>
                                {cd.date.split("T")[0]}
                                {cd.reason ? ` — ${cd.reason}` : ""}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveClosure(cd.id)}
                            >
                                حذف
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}