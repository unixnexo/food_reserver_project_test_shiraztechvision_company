import type { Reservation } from "@/app/dashboard/history/page";
import { ReservationDateGroup } from "./reservation-date-group";

type ReservationHistoryListProps = {
    reservations: Reservation[];
};

export function ReservationHistoryList({
    reservations,
}: ReservationHistoryListProps) {
    const groupedByDate = reservations.reduce<Record<string, Reservation[]>>(
        (groups, reservation) => {
            (groups[reservation.date] ??= []).push(reservation);
            return groups;
        },
        {}
    );

    const dates = Object.keys(groupedByDate).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    return (
        <div className="flex flex-col gap-4">
            {dates.map((date) => (
                <ReservationDateGroup
                    key={date}
                    date={date}
                    reservations={groupedByDate[date]}
                />
            ))}
        </div>
    );
}