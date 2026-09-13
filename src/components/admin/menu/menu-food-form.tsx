"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

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
    const [open, setOpen] = useState(false);

    const selectedFood = foods.find(
        (food) => food.id === selectedFoodId
    );

    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <Popover open={open} onOpenChange={setOpen}>
                {/* <PopoverTrigger asChild className="w-full">
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={isSubmitting || foods.length === 0}
                        className="h-12 w-full min-h-12 flex-1 justify-between rounded-2xl border-border/70 bg-background px-4 text-sm font-normal shadow-none"
                    >
                        {selectedFood?.name ??
                            (foods.length === 0
                                ? "غذای جدیدی برای افزودن وجود ندارد"
                                : "انتخاب غذا")}
                        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger> */}

                <PopoverTrigger
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    disabled={isSubmitting || foods.length === 0}
                    className="h-12 w-full min-h-12 flex-1 justify-between rounded-2xl border border-border/70 bg-background px-4 text-sm font-normal shadow-none"
                >
                    {selectedFood?.name ??
                        (foods.length === 0
                            ? "غذای جدیدی برای افزودن وجود ندارد"
                            : "انتخاب غذا")}
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    className="w-[--radix-popover-trigger-width] rounded-2xl border-border/70 p-0"
                >
                    <Command>
                        <CommandInput placeholder="جستجوی غذا..." />
                        <CommandList>
                            <CommandEmpty>غذایی یافت نشد</CommandEmpty>
                            <CommandGroup>
                                {foods.map((food) => (
                                    <CommandItem
                                        key={food.id}
                                        value={food.name}
                                        onSelect={() => {
                                            onFoodChange(food.id);
                                            setOpen(false);
                                        }}
                                        className="rounded-xl py-3 text-sm"
                                    >
                                        <Check
                                            className={cn(
                                                "ml-2 size-4",
                                                selectedFoodId === food.id
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {food.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <Button
                type="button"
                onClick={onAdd}
                disabled={!selectedFoodId || isSubmitting}
                className="h-12 min-h-12 rounded-2xl bg-[#183D2B] px-5 text-white hover:bg-[#24543C]"
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
