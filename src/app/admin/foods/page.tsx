// src/app/admin/foods/page.tsx
//
// PAGE PURPOSE (for AI agents / future readers):
// Admin manages the food bank — the reusable list of dishes assigned to
// specific menu days on the "تعریف منو" page (/admin/menu). Simple
// list + add-form + delete. Deletion is blocked server-side if the food
// is already used in any MenuItem (see /api/admin/foods/[id]).
//
// DATA SHAPE: Food = { id: string, name: string }

"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Food = { id: string; name: string };

export default function AdminFoodsPage() {
    const [foods, setFoods] = useState<Food[]>([]);
    const [newFoodName, setNewFoodName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function loadFoods() {
        const res = await fetch("/api/admin/foods");
        const data = await res.json();
        if (data.success) setFoods(data.foods);
    }

    useEffect(() => {
        loadFoods();
    }, []);

    async function handleAdd() {
        if (!newFoodName.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/admin/foods", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newFoodName.trim() }),
            });
            const data = await res.json();
            if (!data.success) {
                toast.error(data.error);
                return;
            }
            toast.success("غذا اضافه شد");
            setNewFoodName("");
            loadFoods();
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        const res = await fetch(`/api/admin/foods/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!data.success) {
            toast.error(data.error);
            return;
        }
        toast.success("غذا حذف شد");
        loadFoods();
    }

    return (
        <Card className="max-w-lg">
            <CardHeader>
                <CardTitle>بانک غذا</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="نام غذا"
                        value={newFoodName}
                        onChange={(e) => setNewFoodName(e.target.value)}
                    />
                    <Button onClick={handleAdd} disabled={isSubmitting}>
                        افزودن
                    </Button>
                </div>

                <div className="flex flex-col gap-2">
                    {foods.map((food) => (
                        <div
                            key={food.id}
                            className="flex items-center justify-between border rounded-md p-2 text-sm"
                        >
                            <span>{food.name}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(food.id)}
                            >
                                حذف
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}