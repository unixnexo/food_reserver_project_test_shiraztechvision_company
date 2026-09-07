"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, UtensilsCrossed } from "lucide-react";
import toast from "react-hot-toast";

import { MenuCalendar } from "@/components/admin/menu/menu-calendar";
import { MenuFoodForm } from "@/components/admin/menu/menu-food-form";
import { MenuFoodList } from "@/components/admin/menu/menu-food-list";
import { DeleteMenuFoodDialog } from "@/components/admin/menu/delete-menu-food-dialog";

type Food = {
    id: string;
    name: string;
};

type MenuItem = {
    id: string;
    food: Food;
};

function toDateParam(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatPersianDate(date: Date | undefined): string {
    if (!date) return "—";

    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

export default function AdminMenuPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(
        new Date()
    );

    const [allFoods, setAllFoods] = useState<Food[]>([]);
    const [dayMenuItems, setDayMenuItems] = useState<MenuItem[]>([]);
    const [selectedFoodId, setSelectedFoodId] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [selectedMenuItem, setSelectedMenuItem] =
        useState<MenuItem | null>(null);

    async function loadFoods() {
        try {
            const res = await fetch("/api/admin/foods");
            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "خطا در دریافت غذاها");
                return;
            }

            setAllFoods(data.foods);
        } catch {
            toast.error("خطا در ارتباط با سرور");
        }
    }

    async function loadDayMenu(date: Date) {
        try {
            setIsLoading(true);

            const res = await fetch(
                `/api/admin/menu-items?date=${toDateParam(date)}`
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "خطا در دریافت منوی روز");
                return;
            }

            setDayMenuItems(data.menuItems);
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadFoods();
    }, []);

    useEffect(() => {
        loadDayMenu(selectedDate);
        setSelectedFoodId("");
    }, [selectedDate]);

    async function handleAddFood() {
        if (!selectedFoodId) return;

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/admin/menu-items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    date: toDateParam(selectedDate),
                    foodId: selectedFoodId,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "افزودن غذا انجام نشد");
                return;
            }

            toast.success("غذا به منو اضافه شد");
            setSelectedFoodId("");
            await loadDayMenu(selectedDate);
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDeleteFood() {
        if (!selectedMenuItem) return;

        setIsDeleting(true);

        try {
            const res = await fetch(
                `/api/admin/menu-items/${selectedMenuItem.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "حذف غذا انجام نشد");
                return;
            }

            toast.success("غذا از منو حذف شد");
            setSelectedMenuItem(null);
            await loadDayMenu(selectedDate);
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsDeleting(false);
        }
    }

    const assignedFoodIds = useMemo(
        () => new Set(dayMenuItems.map((item) => item.food.id)),
        [dayMenuItems]
    );

    const availableFoods = useMemo(
        () =>
            allFoods.filter(
                (food) => !assignedFoodIds.has(food.id)
            ),
        [allFoods, assignedFoodIds]
    );

    return (
        <div className="mx-auto w-full max-w-6xl">
            {/* Heading */}
            <div className="mb-8">
                <div className="mb-2 flex items-center gap-3">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#EAF3ED] text-[#183D2B]">
                        <CalendarDays className="size-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        تعریف منو
                    </h1>
                </div>


                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    برای هر روز، غذاهایی را که والدین می‌توانند انتخاب کنند مشخص کنید.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
                {/* Calendar */}
                <MenuCalendar
                    selectedDate={selectedDate}
                    onSelect={(date) => {
                        if (date) setSelectedDate(date);
                    }}
                />

                {/* Day menu */}
                <section className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                    <div className="mb-6 flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3ED] text-[#183D2B]">
                            <UtensilsCrossed className="size-5" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base font-semibold">
                                منوی روز
                            </h2>

                            <p className="mt-1 truncate text-sm text-[#183D2B]">
                                {formatPersianDate(selectedDate)}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                {dayMenuItems.length} غذا برای این روز
                            </p>
                        </div>
                    </div>

                    <div className="mb-6 rounded-2xl bg-muted/40 p-3">
                        <p className="mb-3 text-xs font-medium text-muted-foreground">
                            افزودن غذا به منوی این روز
                        </p>

                        <MenuFoodForm
                            foods={availableFoods}
                            selectedFoodId={selectedFoodId}
                            isSubmitting={isSubmitting}
                            onFoodChange={setSelectedFoodId}
                            onAdd={handleAddFood}
                        />
                    </div>

                    <MenuFoodList
                        items={dayMenuItems}
                        isLoading={isLoading}
                        onDelete={setSelectedMenuItem}
                    />
                </section>
            </div>

            <DeleteMenuFoodDialog
                item={selectedMenuItem}
                isDeleting={isDeleting}
                onClose={() => setSelectedMenuItem(null)}
                onConfirm={handleDeleteFood}
            />
        </div>
    );
}