"use client";

import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Food = {
    id: string;
    name: string;
};

type MenuFoodFormProps = {
    foods: Food[];
    selectedFoodId: string;
    isSubmitting: boolean;
    onFoodChange: (foodId: string) => void;
    onAdd: () => Promise<void>;
};

export function MenuFoodForm({
    foods,
    selectedFoodId,
    isSubmitting,
    onFoodChange,
    onAdd,
}: MenuFoodFormProps) {
    const selectedFood = foods.find(
        (food) => food.id === selectedFoodId
    );

    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <Select
                value={selectedFoodId}
                onValueChange={onFoodChange}
                disabled={isSubmitting || foods.length === 0}
            >
                <SelectTrigger className="h-12 w-full min-h-12 flex-1 rounded-2xl border-border/70 bg-background px-4 text-sm shadow-none">
                    <SelectValue
                        placeholder={
                            foods.length === 0
                                ? "غذای جدیدی برای افزودن وجود ندارد"
                                : "انتخاب غذا"
                        }
                    >
                        {selectedFood?.name}
                    </SelectValue>
                </SelectTrigger>

                <SelectContent
                    position="popper"
                    sideOffset={6}
                    className="max-h-64 overflow-y-auto rounded-2xl border-border/70 p-1"
                >
                    {foods.map((food) => (
                        <SelectItem
                            key={food.id}
                            value={food.id}
                            className="rounded-xl py-3 pr-8 text-sm"
                        >
                            {food.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                type="button"
                onClick={onAdd}
                disabled={!selectedFoodId || isSubmitting}
                className="h-12 min-h-12 shrink-0 rounded-2xl bg-[#183D2B] px-5 text-white hover:bg-[#24543C]"
            >
                {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    <Plus className="size-4" />
                )}

                افزودن به منو
            </Button>
        </div>
    );
}