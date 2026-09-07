// src/lib/reservation/create-order.ts
//
// Shared core logic for creating a reservation order — used by BOTH the
// daily and monthly flows (app/api/reservations/daily/route.ts and
// app/api/reservations/monthly/route.ts). The two flows differ only in:
//   - How the caller determined which dates to include (manual multi-
//     select for daily, "all school days in next month" for monthly)
//   - Which date-range rule applies (current-month-only for daily,
//     next-month-only for monthly)
// Everything else — child ownership check, menu item validity check,
// system-wide one-meal-per-child-per-day check, price snapshotting, order
// total calculation — is identical, so it lives here once.
//
// VALIDATES SERVER-SIDE (never trusts client input beyond shape):
// 1. The child belongs to the requesting parent.
// 2. Every requested date passes the type-specific date rule:
//      DAILY   -> cutoff + current-month-only + school-day
//      MONTHLY -> next-month-only + school-day (no cutoff check — the
//                 whole next month is inherently in the future, so the
//                 5pm/tomorrow cutoff that exists to protect the kitchen's
//                 same-day/next-day prep lead time doesn't apply here)
// 3. Every menuItemId actually corresponds to a MenuItem on the matching
//    date.
// 4. The child does not already have ANY existing order item for that
//    date (system-wide, across past orders too).
//
// Returns a discriminated result rather than throwing for expected
// validation failures.

import { prisma } from "@/lib/prisma";
import { toDateOnly } from "@/lib/date/normalize";
import { isDateSelectableForDailyReservation } from "./daily-availability";
import { isWithinNextJalaliMonth } from "./month-range";
import {
    isSchoolDaySync,
    getClosedDatesInRange,
} from "@/lib/school-calendar/is-school-day";
import type { OrderType } from "@prisma/client";

export type OrderItemInput = {
    date: Date;
    menuItemId: string;
    portionType: "HALF" | "FULL";
};

export type CreateOrderResult =
    | { ok: true; orderId: string; totalAmount: number }
    | { ok: false; error: string; status: number };

export async function createOrder(
    parentId: string,
    type: OrderType,
    childId: string,
    items: OrderItemInput[],
    now: Date = new Date()
): Promise<CreateOrderResult> {
    if (items.length === 0) {
        return { ok: false, error: "حداقل یک روز باید انتخاب شود", status: 400 };
    }

    const child = await prisma.child.findUnique({ where: { id: childId } });

    if (!child || child.parentId !== parentId) {
        return { ok: false, error: "فرزند مورد نظر یافت نشد", status: 404 };
    }

    const dates = items.map((item) => toDateOnly(item.date));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    const closedDates = await getClosedDatesInRange(minDate, maxDate);

    for (const date of dates) {
        const isValidDate =
            type === "DAILY"
                ? isDateSelectableForDailyReservation(date, now, closedDates)
                : isWithinNextJalaliMonth(date, now) && isSchoolDaySync(date, closedDates);

        if (!isValidDate) {
            return {
                ok: false,
                error: `تاریخ ${date.toISOString().split("T")[0]} قابل رزرو نیست`,
                status: 400,
            };
        }
    }

    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
        where: { id: { in: menuItemIds } },
    });
    const menuItemById = new Map(menuItems.map((mi) => [mi.id, mi]));

    for (const item of items) {
        const menuItem = menuItemById.get(item.menuItemId);
        if (!menuItem) {
            return { ok: false, error: "غذای انتخاب شده یافت نشد", status: 404 };
        }
        if (menuItem.date.getTime() !== toDateOnly(item.date).getTime()) {
            return {
                ok: false,
                error: "غذای انتخاب شده برای این تاریخ معتبر نیست",
                status: 400,
            };
        }
    }

    const existingItemsForChild = await prisma.orderItem.findMany({
        where: { childId, date: { in: dates } },
    });

    if (existingItemsForChild.length > 0) {
        const conflictDate = existingItemsForChild[0].date
            .toISOString()
            .split("T")[0];
        return {
            ok: false,
            error: `برای این فرزند در تاریخ ${conflictDate} قبلا غذا رزرو شده است`,
            status: 409,
        };
    }

    const pricing = await prisma.portionPricing.findFirst();
    if (!pricing) {
        return {
            ok: false,
            error: "قیمت‌گذاری تعریف نشده است، با پشتیبانی تماس بگیرید",
            status: 500,
        };
    }

    const itemsWithPrice = items.map((item) => {
        const unitPrice =
            item.portionType === "HALF"
                ? pricing.halfPortionPrice
                : pricing.fullPortionPrice;
        return {
            childId,
            date: toDateOnly(item.date),
            menuItemId: item.menuItemId,
            portionType: item.portionType,
            unitPrice,
        };
    });

    const totalAmount = itemsWithPrice.reduce((sum, item) => sum + item.unitPrice, 0);

    const order = await prisma.order.create({
        data: {
            type,
            status: "PENDING",
            userId: parentId,
            totalAmount,
            items: { create: itemsWithPrice },
        },
    });

    return { ok: true, orderId: order.id, totalAmount };
}