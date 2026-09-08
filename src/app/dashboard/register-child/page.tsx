"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/dashboard/register-child/page-header";
import { NameFields } from "@/components/dashboard/register-child/name-fields";
import { NationalCodeField } from "@/components/dashboard/register-child/national-code-field";
import { GenderField } from "@/components/dashboard/register-child/gender-field";
import { BirthDateField } from "@/components/dashboard/register-child/birth-date-field";
import { SchoolGradeFields } from "@/components/dashboard/register-child/school-grade-fields";
import { SubmitActions } from "@/components/dashboard/register-child/submit-actions";
import { jalaliToGregorian } from "@/lib/date/jalali";

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
        <div className="min-h-dvh bg-[#F7F5F0]">
            <main className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6 sm:py-10">
                <PageHeader />

                <div className="rounded-3xl border border-border/70 bg-background p-5 shadow-sm sm:p-7">
                    <form className="flex flex-col gap-5">
                        <NameFields
                            firstName={form.firstName}
                            lastName={form.lastName}
                            onFirstNameChange={(v) => updateField("firstName", v)}
                            onLastNameChange={(v) => updateField("lastName", v)}
                        />

                        <NationalCodeField
                            value={form.nationalCode}
                            onChange={(v) => updateField("nationalCode", v)}
                        />

                        <GenderField
                            value={form.gender}
                            onChange={(v) => updateField("gender", v)}
                        />

                        <BirthDateField
                            year={form.birthYear}
                            month={form.birthMonth}
                            day={form.birthDay}
                            onYearChange={(v) => updateField("birthYear", v)}
                            onMonthChange={(v) => updateField("birthMonth", v)}
                            onDayChange={(v) => updateField("birthDay", v)}
                        />

                        <SchoolGradeFields
                            schools={schools}
                            grades={grades}
                            schoolId={form.schoolId}
                            gradeId={form.gradeId}
                            onSchoolChange={(v) => updateField("schoolId", v)}
                            onGradeChange={(v) => updateField("gradeId", v)}
                        />

                        <SubmitActions
                            isSubmitting={isSubmitting}
                            onSave={(e) => handleSubmit(e, false)}
                            onSaveAndAddAnother={(e) => handleSubmit(e, true)}
                        />
                    </form>
                </div>
            </main>
        </div>
    );
}