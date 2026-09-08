import type { Reservation } from "@/app/dashboard/history/page";
import { ReservationRow } from "./reservation-row";
import { formatPersianDateString } from "@/lib/date/format-persian-date";
import { CalendarDays } from "lucide-react";

type ReservationDateGroupProps = {
    date: string;
    reservations: Reservation[];
};

export function ReservationDateGroup({
    date,
    reservations,
}: ReservationDateGroupProps) {
    return (
        <section className="overflow-hidden rounded-3xl border border-border/70 bg-background shadow-sm">
            <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]">
                    <CalendarDays className="size-5" />
                </div>

                <div>
                    <p className="text-sm font-semibold">
                        {formatPersianDateString(date)}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {reservations.length.toLocaleString("fa-IR")} رزرو
                    </p>
                </div>
            </div>

            <div className="divide-y divide-border/60">
                {reservations.map((reservation, index) => (
                    <ReservationRow
                        key={`${reservation.orderId} -${index} `}
                        reservation={reservation}
                    />
                ))}
            </div>
        </section>
    );
}