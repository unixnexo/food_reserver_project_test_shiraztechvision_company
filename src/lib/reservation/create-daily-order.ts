// src/lib/reservation/create-daily-order.ts
//
// Core logic for creating a DAILY reservation order. Called by the API
// route (app/api/reservations/daily/route.ts). Isolated here so it can be
// unit tested without spinning up HTTP.
//
// VALIDATES SERVER-SIDE (never trusts client input beyond shape):
// 1. The child belongs to the requesting parent.
// 2. Every requested date is actually selectable under the daily rules
//    (cutoff, current-month-only, school-day) — re-checked here even
//    though the UI also filters this, because the client can't be trusted.
// 3. Every menuItemId actually corresponds to a MenuItem on the matching
//    date (prevents a parent from submitting a food that was never
//    offered that day, or was removed after they loaded the page).
// 4. The child does not already have ANY existing order item for that
//    date (system-wide, across past orders too) — one meal per child per
//    day, per product decision.
//
// On success, creates one Order (type: DAILY, status: PENDING) with one
// OrderItem per requested date, using LIVE portion pricing snapshotted at
// creation time. totalAmount is computed server-side from those snapshot
// prices — never trust a client-submitted total.
//
// Returns a discriminated result rather than throwing for expected
// validation failures, so the API route can map each case to the right
// HTTP status and Persian message.

import { prisma } from "@/lib/prisma";
import { toDateOnly } from "@/lib/date/normalize";
import { isDateSelectableForDailyReservation } from "./daily-availability";
import { getClosedDatesInRange } from "@/lib/school-calendar/is-school-day";
import type { CreateDailyOrderInput } from "@/lib/validations/order";

export type CreateDailyOrderResult =
    | { ok: true; orderId: string; totalAmount: number }
    | { ok: false; error: string; status: number };

export async function createDailyOrder(
    parentId: string,
    input: CreateDailyOrderInput,
    now: Date = new Date()
): Promise<CreateDailyOrderResult> {
    const child = await prisma.child.findUnique({
        where: { id: input.childId },
    });

    if (!child || child.parentId !== parentId) {
        return { ok: false, error: "فرزند مورد نظر یافت نشد", status: 404 };
    }

    const dates = input.items.map((item) => toDateOnly(item.date));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    const closedDates = await getClosedDatesInRange(minDate, maxDate);

    for (const date of dates) {
        if (!isDateSelectableForDailyReservation(date, now, closedDates)) {
            return {
                ok: false,
                error: `تاریخ ${date.toISOString().split("T")[0]} قابل رزرو نیست`,
                status: 400,
            };
        }
    }

    // Verify every menuItemId is real and matches its claimed date.
    const menuItemIds = input.items.map((item) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
        where: { id: { in: menuItemIds } },
    });
    const menuItemById = new Map(menuItems.map((mi) => [mi.id, mi]));

    for (const item of input.items) {
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

    // One meal per child per day, system-wide — check against ALL existing
    // OrderItems for this child on any of the requested dates, regardless
    // of which order they belong to.
    const existingItemsForChild = await prisma.orderItem.findMany({
        where: {
            childId: input.childId,
            date: { in: dates },
        },
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

    const itemsWithPrice = input.items.map((item) => {
        const unitPrice =
            item.portionType === "HALF"
                ? pricing.halfPortionPrice
                : pricing.fullPortionPrice;
        return {
            childId: input.childId,
            date: toDateOnly(item.date),
            menuItemId: item.menuItemId,
            portionType: item.portionType,
            unitPrice,
        };
    });

    const totalAmount = itemsWithPrice.reduce(
        (sum, item) => sum + item.unitPrice,
        0
    );

    const order = await prisma.order.create({
        data: {
            type: "DAILY",
            status: "PENDING",
            userId: parentId,
            totalAmount,
            items: { create: itemsWithPrice },
        },
    });

    return { ok: true, orderId: order.id, totalAmount };
}