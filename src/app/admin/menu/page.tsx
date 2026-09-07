// src/app/admin/menu/page.tsx
//
// PAGE PURPOSE (for AI agents / future readers):
// "تعریف منو" — admin picks a single date on the Persian (Jalali) calendar,
// then assigns/removes foods (from the food bank) for that specific date.
// This defines what parents will be able to choose from when reserving
// for that day (see Step 6/7 reservation flow).
//
// DATA FLOW:
// - Calendar `selected` date drives GET /api/admin/menu-items?date=...
//   which returns the foods already assigned to that date.
// - The food-bank dropdown (GET /api/admin/foods) lists everything
//   available to assign; picking one + clicking "افزودن" POSTs to
//   /api/admin/menu-items.
// - Each assigned food has a "حذف" button → DELETE /api/admin/menu-items/[id],
//   blocked server-side if any parent already ordered it for that day.
//
// Uses shadcn's Calendar component configured for the Persian (Jalali)
// calendar via react-day-picker/persian — see components/ui/calendar.tsx.
// The Date object returned by the calendar is already Gregorian
// internally, so no manual Jalali<->Gregorian conversion is needed here.

"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Food = { id: string; name: string };
type MenuItem = { id: string; food: Food };

function toDateParam(date: Date): string {
    return date.toISOString().split("T")[0];
}

export default function AdminMenuPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date()
    );
    const [allFoods, setAllFoods] = useState<Food[]>([]);
    const [dayMenuItems, setDayMenuItems] = useState<MenuItem[]>([]);
    const [selectedFoodId, setSelectedFoodId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetch("/api/admin/foods")
            .then((res) => res.json())
            .then((data) => data.success && setAllFoods(data.foods));
    }, []);

    useEffect(() => {
        if (!selectedDate) return;
        loadDayMenu(selectedDate);
    }, [selectedDate]);

    async function loadDayMenu(date: Date) {
        setIsLoading(true);
        try {
            const res = await fetch(
                `/api/admin/menu-items?date=${toDateParam(date)}`
            );
            const data = await res.json();
            if (data.success) setDayMenuItems(data.menuItems);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAddFood() {
        if (!selectedDate || !selectedFoodId) return;
        const res = await fetch("/api/admin/menu-items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date: toDateParam(selectedDate),
                foodId: selectedFoodId,
            }),
        });
        const data = await res.json();
        if (!data.success) {
            toast.error(data.error);
            return;
        }
        toast.success("غذا به منو اضافه شد");
        setSelectedFoodId("");
        loadDayMenu(selectedDate);
    }

    async function handleRemoveFood(menuItemId: string) {
        const res = await fetch(`/api/admin/menu-items/${menuItemId}`, {
            method: "DELETE",
        });
        const data = await res.json();
        if (!data.success) {
            toast.error(data.error);
            return;
        }
        toast.success("غذا از منو حذف شد");
        if (selectedDate) loadDayMenu(selectedDate);
    }

    // Foods not yet assigned to this day (avoids offering a duplicate)
    const assignedFoodIds = new Set(dayMenuItems.map((mi) => mi.food.id));
    const availableFoods = allFoods.filter((f) => !assignedFoodIds.has(f.id));

    return (
        <div className="flex flex-wrap gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>انتخاب روز</CardTitle>
                </CardHeader>
                <CardContent>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                    />
                </CardContent>
            </Card>

            <Card className="flex-1 min-w-[300px]">
                <CardHeader>
                    <CardTitle>
                        منوی روز{" "}
                        {selectedDate ? toDateParam(selectedDate) : "—"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        <select
                            className="border rounded-md h-9 px-3 flex-1"
                            value={selectedFoodId}
                            onChange={(e) => setSelectedFoodId(e.target.value)}
                        >
                            <option value="">انتخاب غذا</option>
                            {availableFoods.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                        <Button onClick={handleAddFood} disabled={!selectedFoodId}>
                            افزودن به منو
                        </Button>
                    </div>

                    {isLoading && (
                        <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
                    )}

                    {!isLoading && dayMenuItems.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            برای این روز غذایی ثبت نشده است.
                        </p>
                    )}

                    <div className="flex flex-col gap-2">
                        {dayMenuItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between border rounded-md p-2 text-sm"
                            >
                                <span>{item.food.name}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveFood(item.id)}
                                >
                                    حذف
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}