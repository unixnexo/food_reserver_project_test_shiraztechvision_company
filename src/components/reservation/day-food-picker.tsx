import { Loader2, UtensilsCrossed } from "lucide-react";
import { formatPersianDateString } from "@/lib/date/format-persian-date";

type MenuItem = { id: string; food: { id: string; name: string } };
type PortionType = "HALF" | "FULL";
type Pricing = { halfPortionPrice: number; fullPortionPrice: number };

type DaySelection = {
    date: string;
    menuItemId: string | null;
    portionType: PortionType | null;
    availableMenuItems: MenuItem[] | null;
};

type DayFoodPickerProps = {
    selection: DaySelection;
    pricing: Pricing | null;
    onSelect: (menuItemId: string, portionType: PortionType) => void;
};

function formatToman(amount: number | undefined): string {
    if (amount === undefined) return "—";
    return `${amount.toLocaleString("fa-IR")} تومان`;
}

export function DayFoodPicker({ selection, pricing, onSelect }: DayFoodPickerProps) {
    const isComplete = Boolean(selection.menuItemId && selection.portionType);

    return (
        <div
            className={`rounded-3xl border p-4 transition-colors sm:p-5 ${isComplete ? "border-[#183D2B]/30 bg-[#EAF3ED]/40" : "border-border/70 bg-background"
                }`}
        >
            <p className="mb-3 text-sm font-semibold">
                {formatPersianDateString(selection.date)}
            </p>

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

            <div className="flex flex-col gap-3">
                {selection.availableMenuItems?.map((mi) => {
                    const isFoodSelected = selection.menuItemId === mi.id;

                    return (
                        <div
                            key={mi.id}
                            className={`rounded-2xl border p-3 transition-colors ${isFoodSelected ? "border-[#183D2B] bg-white" : "border-border/60 bg-white"
                                }`}
                        >
                            <p className="mb-2.5 text-sm font-medium">{mi.food.name}</p>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => onSelect(mi.id, "HALF")}
                                    className={`flex h-12 flex-col items-center justify-center rounded-xl border text-xs font-medium transition-colors ${isFoodSelected && selection.portionType === "HALF"
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
                                    onClick={() => onSelect(mi.id, "FULL")}
                                    className={`flex h-12 flex-col items-center justify-center rounded-xl border text-xs font-medium transition-colors ${isFoodSelected && selection.portionType === "FULL"
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
        </div>
    );
}