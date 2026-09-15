"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Apple } from "lucide-react";
import toast from "react-hot-toast";

import { SideForm } from "@/components/admin/sides/side-form";
import { SideList } from "@/components/admin/sides/side-list";
import { SideSearch } from "@/components/admin/sides/side-search";
import { DeleteSideDialog } from "@/components/admin/sides/delete-side-dialog";

type Side = {
    id: string;
    name: string;
};

export default function AdminSidesPage() {
    const [sides, setSides] = useState<Side[]>([]);
    const [search, setSearch] = useState("");
    const [selectedSide, setSelectedSide] = useState<Side | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function loadSides() {
        try {
            setIsLoading(true);

            const res = await fetch("/api/admin/sides");
            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "خطا در دریافت آیتم‌ها");
                return;
            }

            setSides(data.sides);
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadSides();
    }, []);

    async function handleAdd(name: string) {
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/admin/sides", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "افزودن آیتم انجام نشد");
                return;
            }

            toast.success("آیتم با موفقیت اضافه شد");
            await loadSides();
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!selectedSide) return;

        setIsDeleting(true);

        try {
            const res = await fetch(
                `/api/admin/sides/${selectedSide.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "حذف آیتم انجام نشد");
                return;
            }

            toast.success("آیتم با موفقیت حذف شد");
            setSelectedSide(null);
            await loadSides();
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsDeleting(false);
        }
    }

    const filteredSides = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase("fa");

        if (!normalizedSearch) return sides;

        return sides.filter((side) =>
            side.name.toLocaleLowerCase("fa").includes(normalizedSearch)
        );
    }, [sides, search]);

    return (
        <div className="mx-auto w-full max-w-3xl">
            {/* Page heading */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-[#DCE3DE] bg-white shadow-sm">
                <div className="h-1 bg-[#183D2B]" />

                <div className="flex items-center gap-4 px-5 py-5 sm:px-6">

                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]">
                        <Apple className="size-5" />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[#183D2B] sm:text-2xl">
                            پاسفره‌ای
                        </h1>

                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            آیتم‌های جانبی مانند موز یا نوشابه را مدیریت و به غذاهای مربوطه اختصاص دهید.                            </p>
                    </div>
                </div>
            </div>

            {/* Add side */}
            <section className="mb-6 rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                <div className="mb-4">
                    <h2 className="text-base font-semibold">
                        افزودن آیتم جدید
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                        نام آیتم را وارد کنید تا به بانک ضمیمه‌ها اضافه شود.
                    </p>
                </div>

                <SideForm
                    isSubmitting={isSubmitting}
                    onAdd={handleAdd}
                />
            </section>

            {/* Side list */}
            <section className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold">
                            آیتم‌های ثبت‌شده
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                            {sides.length} آیتم در بانک ضمیمه‌ها
                        </p>
                    </div>

                    <div className="w-full sm:max-w-xs">
                        <SideSearch
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
                    <SideList
                        sides={filteredSides}
                        onDelete={setSelectedSide}
                    />
                )}
            </section>

            <DeleteSideDialog
                side={selectedSide}
                isDeleting={isDeleting}
                onClose={() => setSelectedSide(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
}