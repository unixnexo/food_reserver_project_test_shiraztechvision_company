"use client";

import { useState, cloneElement, isValidElement } from "react";
import { Loader2, UtensilsCrossed } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { formatPersianDateString } from "@/lib/date/format-persian-date";

type Booking = {
    foodName: string;
    portionType: "HALF" | "FULL";
    price: number;
    orderStatus: "PENDING" | "PAID" | "FAILED";
};

const STATUS_LABELS: Record<Booking["orderStatus"], string> = {
    PENDING: "در انتظار پرداخت",
    PAID: "پرداخت شده",
    FAILED: "ناموفق",
};

type BookedDayPopoverProps = {
    childId: string;
    date: string;
    children: React.ReactElement;
};

export function BookedDayPopover({
    childId,
    date,
    children,
}: BookedDayPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [booking, setBooking] = useState<Booking | null | undefined>(
        undefined
    );

    async function handleOpen() {
        setIsOpen(true);

        if (booking === undefined) {
            setIsLoading(true);

            try {
                const res = await fetch(
                    `/api/reservations/daily/booked-day?childId=${childId}&date=${date}`
                );

                const data = await res.json();

                if (data.success) {
                    setBooking(data.booking);
                }
            } finally {
                setIsLoading(false);
            }
        }
    }

    const trigger = isValidElement(children)
        ? cloneElement(children, {
            onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                handleOpen();
            },
        } as React.HTMLAttributes<HTMLElement>)
        : children;

    return (
        // <Popover open={isOpen} onOpenChange={setIsOpen}>
        //     <PopoverTrigger asChild>
        //         {trigger}
        //     </PopoverTrigger>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger render={trigger} />

            <PopoverContent className="w-64 rounded-2xl p-4" align="center">
                <p className="mb-3 text-sm font-semibold">
                    {formatPersianDateString(date)}
                </p>

                {isLoading && (
                    <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        در حال دریافت اطلاعات...
                    </div>
                )}

                {!isLoading && booking && (
                    <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2.5 rounded-xl bg-[#EAF3ED] px-3 py-2.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#183D2B] text-white">
                                <UtensilsCrossed className="size-4" />
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                    {booking.foodName}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    {booking.portionType === "HALF"
                                        ? "نیم پرس"
                                        : "تمام پرس"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                قیمت
                            </span>

                            <span className="font-semibold">
                                {booking.price.toLocaleString("fa-IR")} تومان
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                وضعیت
                            </span>

                            <span className="font-medium">
                                {STATUS_LABELS[booking.orderStatus]}
                            </span>
                        </div>
                    </div>
                )}

                {!isLoading && booking === null && (
                    <p className="text-sm text-muted-foreground">
                        اطلاعاتی برای این روز یافت نشد.
                    </p>
                )}
            </PopoverContent>
        </Popover>
    );
}