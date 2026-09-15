// "use client";

// import { useState } from "react";
// import { ChevronDown, Loader2, UtensilsCrossed, Check, AlertCircle } from "lucide-react";
// import { formatPersianDateString } from "@/lib/date/format-persian-date";

// type MenuItem = { id: string; food: { id: string; name: string } };
// type PortionType = "HALF" | "FULL";
// type Pricing = { halfPortionPrice: number; fullPortionPrice: number };

// type DaySelection = {
//     date: string;
//     menuItemId: string | null;
//     portionType: PortionType | null;
//     availableMenuItems: MenuItem[] | null;
//     note?: string;
// };

// type DayFoodPickerProps = {
//     selection: DaySelection;
//     pricing: Pricing | null;
//     onSelect: (menuItemId: string, portionType: PortionType) => void;
//     onNoteChange: (note: string) => void;
//     defaultOpen?: boolean;
// };

// function formatToman(amount: number | undefined): string {
//     if (amount === undefined) return "—";
//     return `${amount.toLocaleString("fa-IR")} تومان`;
// }

// export function DayFoodPicker({
//     selection,
//     pricing,
//     onSelect,
//     onNoteChange,
//     defaultOpen = false,
// }: DayFoodPickerProps) {
//     const isComplete = Boolean(selection.menuItemId && selection.portionType);
//     const [isOpen, setIsOpen] = useState(defaultOpen || !isComplete);

//     const selectedFood = selection.availableMenuItems?.find(
//         (mi) => mi.id === selection.menuItemId
//     );

//     return (
//         <div
//             className={`overflow-hidden rounded-2xl border transition-colors ${isComplete ? "border-[#183D2B]/25" : "border-border/70"
//                 }`}
//         >
//             <button
//                 type="button"
//                 onClick={() => setIsOpen((prev) => !prev)}
//                 className={`flex w-full items-center gap-3 px-4 py-3.5 text-right transition-colors ${isComplete ? "bg-[#EAF3ED]/50" : "bg-background"
//                     }`}
//             >
//                 <div
//                     className={`flex size-9 shrink-0 items-center justify-center rounded-full ${isComplete
//                         ? "bg-[#183D2B] text-white"
//                         : "bg-amber-50 text-amber-600"
//                         }`}
//                 >
//                     {isComplete ? (
//                         <Check className="size-4" />
//                     ) : (
//                         <AlertCircle className="size-4" />
//                     )}
//                 </div>

//                 <div className="min-w-0 flex-1">
//                     <p className="text-sm font-semibold">
//                         {formatPersianDateString(selection.date)}
//                     </p>

//                     {isComplete ? (
//                         <p className="mt-0.5 truncate text-xs text-muted-foreground">
//                             {selectedFood?.food.name} ·{" "}
//                             {selection.portionType === "HALF" ? "نیم پرس" : "تمام پرس"}
//                             {selection.note?.trim() && " · دارای توضیحات"}
//                         </p>
//                     ) : (
//                         <p className="mt-0.5 text-xs text-amber-600">
//                             هنوز غذا انتخاب نشده
//                         </p>
//                     )}
//                 </div>

//                 <ChevronDown
//                     className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""
//                         }`}
//                 />
//             </button>

//             {isOpen && (
//                 <div className="border-t border-border/60 bg-background p-4">
//                     {selection.availableMenuItems === null && (
//                         <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
//                             <Loader2 className="size-4 animate-spin" />
//                             در حال دریافت منو...
//                         </div>
//                     )}

//                     {selection.availableMenuItems?.length === 0 && (
//                         <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-3 py-3 text-sm text-muted-foreground">
//                             <UtensilsCrossed className="size-4 shrink-0" />
//                             برای این روز غذایی تعریف نشده است.
//                         </div>
//                     )}

//                     <div className="flex flex-col gap-2.5">
//                         {selection.availableMenuItems?.map((mi) => {
//                             const isFoodSelected = selection.menuItemId === mi.id;

//                             return (
//                                 <div
//                                     key={mi.id}
//                                     className={`rounded-2xl border p-3 transition-colors ${isFoodSelected
//                                         ? "border-[#183D2B] bg-[#EAF3ED]/30"
//                                         : "border-border/60 bg-white"
//                                         }`}
//                                 >
//                                     <p className="mb-2.5 text-sm font-medium">
//                                         {mi.food.name}
//                                     </p>

//                                     <div className="grid grid-cols-2 gap-2">
//                                         <button
//                                             type="button"
//                                             onClick={() => {
//                                                 onSelect(mi.id, "HALF");
//                                                 setIsOpen(false);
//                                             }}
//                                             className={`flex h-12 flex-col items-center justify-center rounded-xl border text-xs font-medium transition-colors ${isFoodSelected &&
//                                                 selection.portionType === "HALF"
//                                                 ? "border-[#183D2B] bg-[#183D2B] text-white"
//                                                 : "border-border/70 text-foreground hover:bg-muted/50"
//                                                 }`}
//                                         >
//                                             <span>نیم پرس</span>
//                                             <span className="mt-0.5 opacity-80">
//                                                 {formatToman(pricing?.halfPortionPrice)}
//                                             </span>
//                                         </button>

//                                         <button
//                                             type="button"
//                                             onClick={() => {
//                                                 onSelect(mi.id, "FULL");
//                                                 setIsOpen(false);
//                                             }}
//                                             className={`flex h-12 flex-col items-center justify-center rounded-xl border text-xs font-medium transition-colors ${isFoodSelected &&
//                                                 selection.portionType === "FULL"
//                                                 ? "border-[#183D2B] bg-[#183D2B] text-white"
//                                                 : "border-border/70 text-foreground hover:bg-muted/50"
//                                                 }`}
//                                         >
//                                             <span>تمام پرس</span>
//                                             <span className="mt-0.5 opacity-80">
//                                                 {formatToman(pricing?.fullPortionPrice)}
//                                             </span>
//                                         </button>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>

//                     {selection.availableMenuItems && selection.availableMenuItems.length > 0 && (
//                         <div className="mt-3">
//                             <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
//                                 توضیحات (اختیاری) — مثلاً: هویج نباشد
//                             </label>
//                             <textarea
//                                 value={selection.note ?? ""}
//                                 onChange={(e) => onNoteChange(e.target.value)}
//                                 maxLength={300}
//                                 rows={2}
//                                 placeholder="یادداشتی برای غذای این روز..."
//                                 className="w-full resize-none rounded-xl border border-border/70 bg-white px-3 py-2 text-xs outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-[#183D2B]"
//                             />
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }










"use client";

import { useState } from "react";
import { ChevronDown, Loader2, UtensilsCrossed, Check, AlertCircle } from "lucide-react";
import { formatPersianDateString } from "@/lib/date/format-persian-date";

type MenuItem = { id: string; food: { id: string; name: string } };
type PortionType = "HALF" | "FULL";
type Pricing = { halfPortionPrice: number; fullPortionPrice: number };

type SideOption = { id: string; name: string };

type DaySelection = {
    date: string;
    menuItemId: string | null;
    portionType: PortionType | null;
    availableMenuItems: MenuItem[] | null;
    note?: string;
    sideIds?: string[];
};

type DayFoodPickerProps = {
    selection: DaySelection;
    pricing: Pricing | null;
    sides: SideOption[];
    onSelect: (menuItemId: string, portionType: PortionType) => void;
    onNoteChange: (note: string) => void;
    onSideIdsChange: (sideIds: string[]) => void;
    defaultOpen?: boolean;
};

function formatToman(amount: number | undefined): string {
    if (amount === undefined) return "—";
    return `${amount.toLocaleString("fa-IR")} تومان`;
}

export function DayFoodPicker({
    selection,
    pricing,
    sides,
    onSelect,
    onNoteChange,
    onSideIdsChange,
    defaultOpen = false,
}: DayFoodPickerProps) {
    const isComplete = Boolean(selection.menuItemId && selection.portionType);
    const [isOpen, setIsOpen] = useState(defaultOpen || !isComplete);

    const selectedFood = selection.availableMenuItems?.find(
        (mi) => mi.id === selection.menuItemId
    );

    const selectedSideIds = selection.sideIds ?? [];
    const selectedSideNames = sides
        .filter((s) => selectedSideIds.includes(s.id))
        .map((s) => s.name);

    function toggleSide(sideId: string) {
        const next = selectedSideIds.includes(sideId)
            ? selectedSideIds.filter((id) => id !== sideId)
            : [...selectedSideIds, sideId];
        onSideIdsChange(next);
    }

    return (
        <div
            className={`overflow-hidden rounded-2xl border transition-colors ${isComplete ? "border-[#183D2B]/25" : "border-border/70"
                }`}
        >
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-right transition-colors ${isComplete ? "bg-[#EAF3ED]/50" : "bg-background"
                    }`}
            >
                <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${isComplete
                        ? "bg-[#183D2B] text-white"
                        : "bg-amber-50 text-amber-600"
                        }`}
                >
                    {isComplete ? (
                        <Check className="size-4" />
                    ) : (
                        <AlertCircle className="size-4" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                        {formatPersianDateString(selection.date)}
                    </p>

                    {isComplete ? (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {selectedFood?.food.name} ·{" "}
                            {selection.portionType === "HALF" ? "نیم پرس" : "تمام پرس"}
                            {selectedSideNames.length > 0 && ` · ${selectedSideNames.join("، ")}`}
                            {selection.note?.trim() && " · دارای توضیحات"}
                        </p>
                    ) : (
                        <p className="mt-0.5 text-xs text-amber-600">
                            هنوز غذا انتخاب نشده
                        </p>
                    )}
                </div>

                <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {isOpen && (
                <div className="border-t border-border/60 bg-background p-4">
                    {selection.availableMenuItems === null && (
                        <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            در حال دریافت منو...
                        </div>
                    )}

                    {selection.availableMenuItems?.length === 0 && (
                        <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-3 py-3 text-sm text-muted-foreground">
                            <UtensilsCrossed className="size-4 shrink-0" />
                            برای این روز غذایی تعریف نشده است.
                        </div>
                    )}

                    <div className="flex flex-col gap-2.5">
                        {selection.availableMenuItems?.map((mi) => {
                            const isFoodSelected = selection.menuItemId === mi.id;

                            return (
                                <div
                                    key={mi.id}
                                    className={`rounded-2xl border p-3 transition-colors ${isFoodSelected
                                        ? "border-[#183D2B] bg-[#EAF3ED]/30"
                                        : "border-border/60 bg-white"
                                        }`}
                                >
                                    <p className="mb-2.5 text-sm font-medium">
                                        {mi.food.name}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onSelect(mi.id, "HALF");
                                                setIsOpen(false);
                                            }}
                                            className={`flex h-12 flex-col items-center justify-center rounded-xl border text-xs font-medium transition-colors ${isFoodSelected &&
                                                selection.portionType === "HALF"
                                                ? "border-[#183D2B] bg-[#183D2B] text-white"
                                                : "border-border/70 text-foreground hover:bg-muted/50"
                                                }`}
                                        >
                                            <span>نیم پرس</span>
                                            <span className="mt-0.5 opacity-80">
                                                {formatToman(pricing?.halfPortionPrice)}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                onSelect(mi.id, "FULL");
                                                setIsOpen(false);
                                            }}
                                            className={`flex h-12 flex-col items-center justify-center rounded-xl border text-xs font-medium transition-colors ${isFoodSelected &&
                                                selection.portionType === "FULL"
                                                ? "border-[#183D2B] bg-[#183D2B] text-white"
                                                : "border-border/70 text-foreground hover:bg-muted/50"
                                                }`}
                                        >
                                            <span>تمام پرس</span>
                                            <span className="mt-0.5 opacity-80">
                                                {formatToman(pricing?.fullPortionPrice)}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {selection.availableMenuItems && selection.availableMenuItems.length > 0 && (
                        <div className="mt-3">
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                توضیحات (اختیاری) — مثلاً: هویج نباشد
                            </label>
                            <textarea
                                value={selection.note ?? ""}
                                onChange={(e) => onNoteChange(e.target.value)}
                                maxLength={300}
                                rows={2}
                                placeholder="یادداشتی برای غذای این روز..."
                                className="w-full resize-none rounded-xl border border-border/70 bg-white px-3 py-2 text-xs outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-[#183D2B]"
                            />
                        </div>
                    )}

                    {selection.availableMenuItems &&
                        selection.availableMenuItems.length > 0 &&
                        sides.length > 0 && (
                            <div className="mt-3">
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    ضمیمه (اختیاری)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {sides.map((side) => {
                                        const isSelected = selectedSideIds.includes(side.id);
                                        return (
                                            <button
                                                key={side.id}
                                                type="button"
                                                onClick={() => toggleSide(side.id)}
                                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${isSelected
                                                        ? "border-[#183D2B] bg-[#183D2B] text-white"
                                                        : "border-border/70 text-foreground hover:bg-muted/50"
                                                    }`}
                                            >
                                                {side.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}


