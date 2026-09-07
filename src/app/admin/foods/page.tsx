"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, UtensilsCrossed } from "lucide-react";
import toast from "react-hot-toast";

import { FoodForm } from "@/components/admin/foods/food-form";
import { FoodList } from "@/components/admin/foods/food-list";
import { FoodSearch } from "@/components/admin/foods/food-search";
import { DeleteFoodDialog } from "@/components/admin/foods/delete-food-dialog";

type Food = {
    id: string;
    name: string;
};

export default function AdminFoodsPage() {
    const [foods, setFoods] = useState<Food[]>([]);
    const [search, setSearch] = useState("");
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function loadFoods() {
        try {
            setIsLoading(true);

            const res = await fetch("/api/admin/foods");
            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "خطا در دریافت غذاها");
                return;
            }

            setFoods(data.foods);
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadFoods();
    }, []);

    async function handleAdd(name: string) {
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/admin/foods", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "افزودن غذا انجام نشد");
                return;
            }

            toast.success("غذا با موفقیت اضافه شد");
            await loadFoods();
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!selectedFood) return;

        setIsDeleting(true);

        try {
            const res = await fetch(
                `/api/admin/foods/${selectedFood.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "حذف غذا انجام نشد");
                return;
            }

            toast.success("غذا با موفقیت حذف شد");
            setSelectedFood(null);
            await loadFoods();
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsDeleting(false);
        }
    }

    const filteredFoods = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase("fa");

        if (!normalizedSearch) return foods;

        return foods.filter((food) =>
            food.name.toLocaleLowerCase("fa").includes(normalizedSearch)
        );
    }, [foods, search]);

    return (
        <div className="mx-auto w-full max-w-3xl">
            {/* Page heading */}
            <div className="mb-8">
                <div className="mb-2 flex items-center gap-3">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#EAF3ED] text-[#183D2B]">
                        <UtensilsCrossed className="size-6" />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        بانک غذا
                    </h1>
                </div>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    غذاهای قابل استفاده در منوهای مدرسه را مدیریت کنید.
                </p>
            </div>

            {/* Add food */}
            <section className="mb-6 rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                <div className="mb-4">
                    <h2 className="text-base font-semibold">
                        افزودن غذای جدید
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                        نام غذا را وارد کنید تا به بانک غذا اضافه شود.
                    </p>
                </div>

                <FoodForm
                    isSubmitting={isSubmitting}
                    onAdd={handleAdd}
                />
            </section>

            {/* Food list */}
            <section className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold">
                            غذاهای ثبت‌شده
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                            {foods.length} غذا در بانک غذا
                        </p>
                    </div>

                    <div className="w-full sm:max-w-xs">
                        <FoodSearch
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
                    <FoodList
                        foods={filteredFoods}
                        onDelete={setSelectedFood}
                    />
                )}
            </section>

            <DeleteFoodDialog
                food={selectedFood}
                isDeleting={isDeleting}
                onClose={() => setSelectedFood(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
}