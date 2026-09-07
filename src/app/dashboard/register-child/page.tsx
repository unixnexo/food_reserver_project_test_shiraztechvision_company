// src/app/dashboard/register-child/page.tsx
//
// PAGE PURPOSE (for AI agents / future readers):
// Form for a logged-in parent to register a child. Requires an active
// session (enforced by middleware.ts — unauthenticated users are
// redirected to /login before this page ever renders).
//
// DATA FLOW:
// - On mount, fetches GET /api/schools and GET /api/grades to populate
//   the two dropdowns.
// - Birthdate is collected via 3 plain <select> dropdowns (day/month/year)
//   in the Jalali calendar, then converted to a Gregorian Date client-side
//   (see lib/date/jalali.ts) before being sent to the API — the API always
//   receives/stores Gregorian dates.
// - On submit, POSTs to /api/children with the full child payload.
//
// TWO SUBMIT BUTTONS (per product decision):
//   "ذخیره" (Save)                → submits, then redirects to /dashboard
//   "ذخیره و افزودن فرزند دیگر"   → submits, then RESETS the form in place
//                                    (same page) so the parent can register
//                                    another child immediately. Under the
//                                    hood both buttons hit the exact same
//                                    API endpoint — the only difference is
//                                    what happens client-side after a
//                                    successful response.
//
// This is intentionally bare-bones styling — full UI/UX pass happens later.

"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    PERSIAN_MONTH_NAMES,
    jalaliToGregorian,
    jalaliMonthLength,
    getBirthYearRange,
} from "@/lib/date/jalali";

type Option = { id: string; name: string };

const EMPTY_FORM = {
    firstName: "",
    lastName: "",
    nationalCode: "",
    gender: "MALE" as "MALE" | "FEMALE",
    gradeId: "",
    schoolId: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
};

export default function RegisterChildPage() {
    const router = useRouter();
    const [schools, setSchools] = useState<Option[]>([]);
    const [grades, setGrades] = useState<Option[]>([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch("/api/schools")
            .then((res) => res.json())
            .then((data) => data.success && setSchools(data.schools));

        fetch("/api/grades")
            .then((res) => res.json())
            .then((data) => data.success && setGrades(data.grades));
    }, []);

    const years = getBirthYearRange();
    const dayCount =
        form.birthYear && form.birthMonth
            ? jalaliMonthLength(Number(form.birthYear), Number(form.birthMonth))
            : 31;

    function updateField<K extends keyof typeof EMPTY_FORM>(
        key: K,
        value: (typeof EMPTY_FORM)[K]
    ) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function submitChild(): Promise<boolean> {
        if (!form.birthYear || !form.birthMonth || !form.birthDay) {
            toast.error("تاریخ تولد را کامل انتخاب کنید");
            return false;
        }

        const birthDate = jalaliToGregorian(
            Number(form.birthYear),
            Number(form.birthMonth),
            Number(form.birthDay)
        );

        const res = await fetch("/api/children", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: form.firstName,
                lastName: form.lastName,
                nationalCode: form.nationalCode,
                gender: form.gender,
                gradeId: form.gradeId,
                schoolId: form.schoolId,
                birthDate: birthDate.toISOString(),
            }),
        });

        const data = await res.json();

        if (!data.success) {
            toast.error(data.error ?? "خطایی رخ داد");
            return false;
        }

        return true;
    }

    async function handleSubmit(e: FormEvent, andAddAnother: boolean) {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const success = await submitChild();
            if (!success) return;

            toast.success("فرزند با موفقیت ثبت شد");

            if (andAddAnother) {
                setForm(EMPTY_FORM);
            } else {
                router.push("/dashboard");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>ثبت اطلاعات فرزند</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="firstName">نام</Label>
                                <Input
                                    id="firstName"
                                    value={form.firstName}
                                    onChange={(e) => updateField("firstName", e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="lastName">نام خانوادگی</Label>
                                <Input
                                    id="lastName"
                                    value={form.lastName}
                                    onChange={(e) => updateField("lastName", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="nationalCode">کد ملی</Label>
                            <Input
                                id="nationalCode"
                                dir="ltr"
                                maxLength={10}
                                value={form.nationalCode}
                                onChange={(e) => updateField("nationalCode", e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>جنسیت</Label>
                            <select
                                className="border rounded-md h-9 px-3"
                                value={form.gender}
                                onChange={(e) =>
                                    updateField("gender", e.target.value as "MALE" | "FEMALE")
                                }
                            >
                                <option value="MALE">پسر</option>
                                <option value="FEMALE">دختر</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>تاریخ تولد</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <select
                                    className="border rounded-md h-9 px-2"
                                    value={form.birthYear}
                                    onChange={(e) => updateField("birthYear", e.target.value)}
                                >
                                    <option value="">سال</option>
                                    {years.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="border rounded-md h-9 px-2"
                                    value={form.birthMonth}
                                    onChange={(e) => updateField("birthMonth", e.target.value)}
                                >
                                    <option value="">ماه</option>
                                    {PERSIAN_MONTH_NAMES.map((name, index) => (
                                        <option key={name} value={index + 1}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="border rounded-md h-9 px-2"
                                    value={form.birthDay}
                                    onChange={(e) => updateField("birthDay", e.target.value)}
                                >
                                    <option value="">روز</option>
                                    {Array.from({ length: dayCount }, (_, i) => i + 1).map(
                                        (d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>مدرسه</Label>
                            <select
                                className="border rounded-md h-9 px-3"
                                value={form.schoolId}
                                onChange={(e) => updateField("schoolId", e.target.value)}
                            >
                                <option value="">انتخاب کنید</option>
                                {schools.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>مقطع تحصیلی</Label>
                            <select
                                className="border rounded-md h-9 px-3"
                                value={form.gradeId}
                                onChange={(e) => updateField("gradeId", e.target.value)}
                            >
                                <option value="">انتخاب کنید</option>
                                {grades.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="button"
                                disabled={isSubmitting}
                                onClick={(e) => handleSubmit(e, false)}
                            >
                                ذخیره
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={isSubmitting}
                                onClick={(e) => handleSubmit(e, true)}
                            >
                                ذخیره و افزودن فرزند دیگر
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}