"use client";

import { Loader2, Trash2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Food = {
    id: string;
    name: string;
};

type MenuItem = {
    id: string;
    food: Food;
};

type MenuFoodListProps = {
    items: MenuItem[];
    isLoading: boolean;
    hasLoadedOnce: boolean;
    onDelete: (item: MenuItem) => void;
};

export function MenuFoodList({
    items,
    isLoading,
    hasLoadedOnce,
    onDelete,
}: MenuFoodListProps) {
    if (isLoading && !hasLoadedOnce) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="size-6 animate-spin text-[#183D2B]" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 px-6 py-14 text-center">
                {/* unchanged */}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "divide-y divide-border/60 overflow-hidden rounded-3xl border border-border/70 transition-opacity",
                isLoading && "opacity-50"
            )}
        >            {items.map((item, index) => (
            <div
                key={item.id}
                className="flex items-center justify-between gap-4 bg-background px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5"
            >
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-sm font-bold text-[#183D2B]">
                        {index + 1}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                            {item.food.name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            قابل انتخاب برای والدین
                        </p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item)}
                    className="size-10 shrink-0 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600"
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
        ))}
        </div>
    );
}