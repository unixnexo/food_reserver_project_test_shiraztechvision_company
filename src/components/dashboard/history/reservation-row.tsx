import type { Reservation } from "@/app/dashboard/history/page";

type ReservationRowProps = {
    reservation: Reservation;
};

const STATUS_LABELS: Record<Reservation["orderStatus"], string> = {
    PENDING: "در انتظار پرداخت",
    PAID: "پرداخت شده",
    FAILED: "ناموفق",
};

const STATUS_STYLES: Record<Reservation["orderStatus"], string> = {
    PENDING: "bg-amber-50 text-amber-700",
    PAID: "bg-[#EAF3ED] text-[#183D2B]",
    FAILED: "bg-red-50 text-red-600",
};

export function ReservationRow({ reservation }: ReservationRowProps) {
    const isHalf = reservation.portionType === "HALF";

    return (
        <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                    {reservation.childName}
                </p>

                <p className="mt-1 truncate text-sm text-muted-foreground">
                    {reservation.foodName}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        {isHalf ? "نیم‌پرس" : "تمام‌پرس"}
                    </span>

                    <span className="text-muted-foreground/50">·</span>

                    <span
                        className={`rounded - full px - 2.5 py - 1 text - [11px] font - medium ${STATUS_STYLES[reservation.orderStatus]} `}
                    >
                        {STATUS_LABELS[reservation.orderStatus]}
                    </span>
                </div>
            </div>

            <div className="shrink-0 text-left">
                <p className="text-sm font-semibold tabular-nums">
                    {reservation.amount.toLocaleString("fa-IR")}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                    تومان
                </p>
            </div>
        </div>
    );
}