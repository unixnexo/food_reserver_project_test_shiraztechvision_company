"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FoodFormProps = {
    isSubmitting: boolean;
    onAdd: (name: string) => Promise<void>;
};

export function FoodForm({
    isSubmitting,
    onAdd,
}: FoodFormProps) {
    const [name, setName] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) return;

        await onAdd(trimmedName);
        setName("");
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row"
        >
            <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: قورمه سبزی"
                disabled={isSubmitting}
                className="h-12 rounded-2xl border-border/70 bg-muted/40 px-4 text-sm shadow-none"
            />

            <Button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="h-12 shrink-0 rounded-2xl bg-[#183D2B] px-5 text-white hover:bg-[#24543C] sm:w-auto"
            >
                {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    <Plus className="size-4" />
                )}

                <span>افزودن غذا</span>
            </Button>
        </form>
    );
}