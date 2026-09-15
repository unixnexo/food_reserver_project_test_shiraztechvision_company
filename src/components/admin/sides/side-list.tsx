"use client";

import { Trash2, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";

type Side = {
    id: string;
    name: string;
};

type SideListProps = {
    sides: Side[];
    onDelete: (side: Side) => void;
};

export function SideList({
    sides,
    onDelete,
}: SideListProps) {
    if (sides.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 px-6 py-14 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                    <Apple className="size-6 text-muted-foreground" />
                </div>

                <h3 className="text-sm font-semibold">
                    آیتمی پیدا نشد
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                    هنوز آیتمی به بانک ضمیمه‌ها اضافه نشده است.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-border/60 overflow-hidden rounded-3xl border border-border/70">
            {sides.map((side) => (
                <div
                    key={side.id}
                    className="flex items-center justify-between gap-4 bg-background px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5"
                >
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]">
                            <Apple className="size-4" />
                        </div>

                        <span className="truncate text-sm font-medium">
                            {side.name}
                        </span>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(side)}
                        className="size-10 shrink-0 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
}