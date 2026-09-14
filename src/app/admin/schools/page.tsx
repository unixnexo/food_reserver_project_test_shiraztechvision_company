"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, School as SchoolIcon } from "lucide-react";
import toast from "react-hot-toast";

import { SchoolForm } from "@/components/admin/schools/school-form";
import { SchoolList } from "@/components/admin/schools/school-list";
import { SchoolSearch } from "@/components/admin/schools/school-search";
import { DeleteSchoolDialog } from "@/components/admin/schools/delete-school-dialog";

type School = {
    id: string;
    name: string;
};

export default function AdminSchoolsPage() {
    const [schools, setSchools] = useState<School[]>([]);
    const [search, setSearch] = useState("");
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function loadSchools() {
        try {
            setIsLoading(true);

            const res = await fetch("/api/admin/schools");
            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "خطا در دریافت مدرسه‌ها");
                return;
            }

            setSchools(data.schools);
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadSchools();
    }, []);

    async function handleAdd(name: string) {
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/admin/schools", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "افزودن مدرسه انجام نشد");
                return;
            }

            toast.success("مدرسه با موفقیت اضافه شد");
            await loadSchools();
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleRename(school: School, newName: string) {
        setIsRenaming(true);

        try {
            const res = await fetch(`/api/admin/schools/${school.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: newName }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "ویرایش مدرسه انجام نشد");
                return;
            }

            toast.success("نام مدرسه بروزرسانی شد");
            await loadSchools();
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsRenaming(false);
        }
    }

    async function handleDelete() {
        if (!selectedSchool) return;

        setIsDeleting(true);

        try {
            const res = await fetch(
                `/api/admin/schools/${selectedSchool.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "حذف مدرسه انجام نشد");
                return;
            }

            toast.success("مدرسه با موفقیت حذف شد");
            setSelectedSchool(null);
            await loadSchools();
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsDeleting(false);
        }
    }

    const filteredSchools = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase("fa");

        if (!normalizedSearch) return schools;

        return schools.filter((school) =>
            school.name.toLocaleLowerCase("fa").includes(normalizedSearch)
        );
    }, [schools, search]);

    return (
        <div className="mx-auto w-full max-w-3xl">
            {/* Page heading */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-[#DCE3DE] bg-white shadow-sm">
                <div className="h-1 bg-[#183D2B]" />

                <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]">
                        <SchoolIcon className="size-5" />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[#183D2B] sm:text-2xl">
                            مدرسه‌ها
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            مدرسه‌های قابل انتخاب هنگام ثبت‌نام دانش‌آموز را مدیریت کنید.
                        </p>
                    </div>
                </div>
            </div>

            {/* Add school */}
            <section className="mb-6 rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                <div className="mb-4">
                    <h2 className="text-base font-semibold">
                        افزودن مدرسه جدید
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                        نام مدرسه را وارد کنید تا به فهرست اضافه شود.
                    </p>
                </div>

                <SchoolForm
                    isSubmitting={isSubmitting}
                    onAdd={handleAdd}
                />
            </section>

            {/* School list */}
            <section className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold">
                            مدرسه‌های ثبت‌شده
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                            {schools.length} مدرسه ثبت شده
                        </p>
                    </div>

                    <div className="w-full sm:max-w-xs">
                        <SchoolSearch
                            value={search}
                            onChange={setSearch}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="size-6 animate-spin text-[#183D2B]" />
                    </div>
                ) : (
                    <SchoolList
                        schools={filteredSchools}
                        isRenaming={isRenaming}
                        onDelete={setSelectedSchool}
                        onRename={handleRename}
                    />
                )}
            </section>

            <DeleteSchoolDialog
                school={selectedSchool}
                isDeleting={isDeleting}
                onClose={() => setSelectedSchool(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
}