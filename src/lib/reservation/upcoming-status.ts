// Computes each child's food-reservation status for today, tomorrow, and
// the day after tomorrow — skipping non-school days (Thu/Fri/closed),
// per product decision that off days don't count toward this check.
//
// Used by the parent dashboard to show a quick "has food" / "needs
// reservation" signal per child, and to flag urgency (must book before
// today's 5pm cutoff for tomorrow).

import { prisma } from "@/lib/prisma";
import { toDateOnly, toDateParam } from "@/lib/date/normalize";
import { getClosedDatesInRange } from "@/lib/school-calendar/is-school-day";
import { isSchoolDaySync } from "@/lib/school-calendar/is-school-day";
import { getEarliestBookableDate } from "./cutoff";

export type DayStatus = {
    date: string;
    hasReservation: boolean;
    foodName: string | null;
    portionType: "HALF" | "FULL" | null;
};

export type ChildUpcomingStatus = {
    childId: string;
    days: DayStatus[]; // only school days within the 3-day window
    needsAction: boolean; // true if the earliest bookable school day in the window has no reservation
};

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
}

export async function getChildrenUpcomingStatus(
    childIds: string[],
    now: Date = new Date()
): Promise<Map<string, ChildUpcomingStatus>> {
    const today = toDateOnly(now);

    // Look ahead far enough to always find 3 school days even with
    // consecutive off days (generous 14-day safety window).
    const searchEnd = addDays(today, 14);
    const closedDates = await getClosedDatesInRange(today, searchEnd);

    const schoolDaysInWindow: Date[] = [];
    let cursor = today;
    while (schoolDaysInWindow.length < 3 && cursor.getTime() <= searchEnd.getTime()) {
        if (isSchoolDaySync(cursor, closedDates)) {
            schoolDaysInWindow.push(cursor);
        }
        cursor = addDays(cursor, 1);
    }

    if (childIds.length === 0 || schoolDaysInWindow.length === 0) {
        return new Map(
            childIds.map((id) => [
                id,
                { childId: id, days: [], needsAction: false },
            ])
        );
    }

    const rangeStart = schoolDaysInWindow[0];
    const rangeEnd = schoolDaysInWindow[schoolDaysInWindow.length - 1];

    const orderItems = await prisma.orderItem.findMany({
        where: {
            childId: { in: childIds },
            date: { gte: rangeStart, lte: rangeEnd },
            order: { status: "PAID" },
        },
        select: {
            childId: true,
            date: true,
            portionType: true,
            menuItem: { select: { food: { select: { name: true } } } },
        },
    });

    const reservedByKey = new Map(
        orderItems.map((oi) => [
            `${oi.childId}:${toDateParam(oi.date)}`,
            { foodName: oi.menuItem.food.name, portionType: oi.portionType },
        ])
    );
    const reservedKey = new Set(
        orderItems.map((oi) => `${oi.childId}:${toDateParam(oi.date)}`)
    );

    const earliestBookable = getEarliestBookableDate(now);

    const result = new Map<string, ChildUpcomingStatus>();

    for (const childId of childIds) {
        const days: DayStatus[] = schoolDaysInWindow.map((d) => {
            const key = `${childId}:${toDateParam(d)}`;
            const reserved = reservedByKey.get(key);

            return {
                date: toDateParam(d),
                hasReservation: Boolean(reserved),
                foodName: reserved?.foodName ?? null,
                portionType: reserved?.portionType ?? null,
            };
        });

        const earliestBookableInWindow = schoolDaysInWindow.find(
            (d) => d.getTime() >= earliestBookable.getTime()
        );

        const needsAction = earliestBookableInWindow
            ? !reservedByKey.has(`${childId}:${toDateParam(earliestBookableInWindow)}`)
            : false;

        result.set(childId, { childId, days, needsAction });
    }

    return result;
}