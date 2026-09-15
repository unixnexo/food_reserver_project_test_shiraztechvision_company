// // src/lib/reservation/create-order.ts
// //
// // Shared core logic for creating a reservation order — used by BOTH the
// // daily and monthly flows (app/api/reservations/daily/route.ts and
// // app/api/reservations/monthly/route.ts). The two flows differ only in:
// //   - How the caller determined which dates to include (manual multi-
// //     select for daily, "all school days in next month" for monthly)
// //   - Which date-range rule applies (current-month-only for daily,
// //     next-month-only for monthly)
// // Everything else — child ownership check, menu item validity check,
// // system-wide one-meal-per-child-per-day check, price snapshotting, order
// // total calculation — is identical, so it lives here once.
// //
// // VALIDATES SERVER-SIDE (never trusts client input beyond shape):
// // 1. The child belongs to the requesting parent.
// // 2. Every requested date passes the type-specific date rule:
// //      DAILY   -> cutoff + current-month-only + school-day
// //      MONTHLY -> next-month-only + school-day (no cutoff check — the
// //                 whole next month is inherently in the future, so the
// //                 5pm/tomorrow cutoff that exists to protect the kitchen's
// //                 same-day/next-day prep lead time doesn't apply here)
// // 3. Every menuItemId actually corresponds to a MenuItem on the matching
// //    date.
// // 4. The child does not already have ANY existing order item for that
// //    date (system-wide, across past orders too).
// //
// // Returns a discriminated result rather than throwing for expected
// // validation failures.

// import { prisma } from "@/lib/prisma";
// import { toDateOnly } from "@/lib/date/normalize";
// import { isDateSelectableForDailyReservation } from "./daily-availability";
// import { isWithinNextJalaliMonth } from "./month-range";
// import {
//     isSchoolDaySync,
//     getClosedDatesInRange,
// } from "@/lib/school-calendar/is-school-day";
// import { Prisma, type OrderType, type PaymentMethod } from "@prisma/client";
// import { generateTrackingCode } from "@/lib/payment/tracking-code";
// import { getSmsSender } from "@/lib/sms/sms-sender";
// import { orderPlacedMessage } from "@/lib/sms/templates";

// export type OrderItemInput = {
//     date: Date;
//     menuItemId: string;
//     portionType: "HALF" | "FULL";
//     note?: string;
// };

// export type CreateOrderResult =
//     | { ok: true; orderId: string; totalAmount: number; status: "PENDING" | "PAID" }
//     | { ok: false; error: string; status: number };

// export async function createOrder(
//     parentId: string,
//     type: OrderType,
//     childId: string,
//     items: OrderItemInput[],
//     now: Date = new Date(),
//     paymentMethod: PaymentMethod = "GATEWAY"
// ): Promise<CreateOrderResult> {
//     if (items.length === 0) {
//         return { ok: false, error: "حداقل یک روز باید انتخاب شود", status: 400 };
//     }

//     const child = await prisma.child.findUnique({ where: { id: childId } });

//     if (!child || child.parentId !== parentId) {
//         return { ok: false, error: "فرزند مورد نظر یافت نشد", status: 404 };
//     }

//     const dates = items.map((item) => toDateOnly(item.date));
//     const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
//     const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
//     const closedDates = await getClosedDatesInRange(minDate, maxDate);

//     for (const date of dates) {
//         const isValidDate =
//             type === "DAILY"
//                 ? isDateSelectableForDailyReservation(date, now, closedDates)
//                 : isWithinNextJalaliMonth(date, now) && isSchoolDaySync(date, closedDates);

//         if (!isValidDate) {
//             return {
//                 ok: false,
//                 error: `تاریخ ${date.toISOString().split("T")[0]} قابل رزرو نیست`,
//                 status: 400,
//             };
//         }
//     }

//     const menuItemIds = items.map((item) => item.menuItemId);
//     const menuItems = await prisma.menuItem.findMany({
//         where: { id: { in: menuItemIds } },
//     });
//     const menuItemById = new Map(menuItems.map((mi) => [mi.id, mi]));

//     for (const item of items) {
//         const menuItem = menuItemById.get(item.menuItemId);
//         if (!menuItem) {
//             return { ok: false, error: "غذای انتخاب شده یافت نشد", status: 404 };
//         }
//         if (menuItem.date.getTime() !== toDateOnly(item.date).getTime()) {
//             return {
//                 ok: false,
//                 error: "غذای انتخاب شده برای این تاریخ معتبر نیست",
//                 status: 400,
//             };
//         }
//     }

//     // Fast-path check: gives a clean error message in the common case (no
//     // concurrent request). This alone does NOT close the race window — two
//     // simultaneous requests could both pass this check before either
//     // commits. The DB-level @@unique([childId, date]) constraint on
//     // OrderItem (see schema.prisma) is what actually guarantees correctness
//     // under concurrency; the try/catch below handles that constraint firing.
//     const existingItemsForChild = await prisma.orderItem.findMany({
//         where: { childId, date: { in: dates }, status: "ACTIVE" },
//     });

//     if (existingItemsForChild.length > 0) {
//         const conflictDate = existingItemsForChild[0].date
//             .toISOString()
//             .split("T")[0];
//         return {
//             ok: false,
//             error: `برای این فرزند در تاریخ ${conflictDate} قبلا غذا رزرو شده است`,
//             status: 409,
//         };
//     }

//     const pricing = await prisma.portionPricing.findFirst();
//     if (!pricing) {
//         return {
//             ok: false,
//             error: "قیمت‌گذاری تعریف نشده است، با پشتیبانی تماس بگیرید",
//             status: 500,
//         };
//     }

//     const halfPrice = type === "DAILY" ? pricing.dailyHalfPrice : pricing.monthlyHalfPrice;
//     const fullPrice = type === "DAILY" ? pricing.dailyFullPrice : pricing.monthlyFullPrice;

//     const itemsWithPrice = items.map((item) => {
//         const unitPrice = item.portionType === "HALF" ? halfPrice : fullPrice;
//         return {
//             childId,
//             date: toDateOnly(item.date),
//             menuItemId: item.menuItemId,
//             portionType: item.portionType,
//             unitPrice,
//             note: item.note?.trim() || null,
//         };
//     });

//     const totalAmount = itemsWithPrice.reduce((sum, item) => sum + item.unitPrice, 0);

//     try {
//         // Wrapped in a transaction so the order and all its items are created
//         // atomically — if the unique constraint rejects ANY item (a
//         // concurrent request won the race for that child+date), the whole
//         // order creation rolls back rather than leaving a partial order.
//         // For WALLET payments, the balance check + debit + ledger entry all
//         // happen inside this SAME transaction, so a wallet debit can never
//         // succeed while the order creation fails (or vice versa).
//         const order = await prisma.$transaction(async (tx) => {
//             if (paymentMethod === "WALLET") {
//                 const user = await tx.user.findUnique({
//                     where: { id: parentId },
//                     select: { walletBalance: true },
//                 });

//                 if (!user || user.walletBalance < totalAmount) {
//                     // Thrown (not returned) so it propagates out of the
//                     // transaction and rolls back cleanly; caught below and
//                     // converted into the normal discriminated-result shape.
//                     throw new InsufficientWalletBalanceError();
//                 }

//                 const newBalance = user.walletBalance - totalAmount;

//                 await tx.user.update({
//                     where: { id: parentId },
//                     data: { walletBalance: newBalance },
//                 });

//                 const createdOrder = await tx.order.create({
//                     data: {
//                         type,
//                         status: "PAID",
//                         paymentMethod: "WALLET",
//                         userId: parentId,
//                         totalAmount,
//                         trackingCode: generateTrackingCode(),
//                         items: { create: itemsWithPrice },
//                     },
//                 });

//                 await tx.walletTransaction.create({
//                     data: {
//                         userId: parentId,
//                         type: "DEBIT",
//                         reason: "WALLET_PAYMENT",
//                         amount: totalAmount,
//                         orderId: createdOrder.id,
//                         balanceAfter: newBalance,
//                     },
//                 });

//                 return createdOrder;
//             }

//             return tx.order.create({
//                 data: {
//                     type,
//                     status: "PENDING",
//                     paymentMethod: "GATEWAY",
//                     userId: parentId,
//                     totalAmount,
//                     items: { create: itemsWithPrice },
//                 },
//             });
//         });

//         if (order.status === "PAID") {
//             // Wallet payments are confirmed instantly — send the "order
//             // placed" SMS right away (gateway orders get this from the
//             // payment callback instead, once Zarinpal actually confirms).
//             const user = await prisma.user.findUnique({
//                 where: { id: parentId },
//                 select: { phone: true },
//             });
//             if (user) {
//                 await getSmsSender().send(user.phone, orderPlacedMessage(totalAmount));
//             }
//         }

//         return {
//             ok: true,
//             orderId: order.id,
//             totalAmount,
//             status: order.status as "PENDING" | "PAID",
//         };
//     } catch (error) {
//         if (error instanceof InsufficientWalletBalanceError) {
//             return {
//                 ok: false,
//                 error: "موجودی کیف پول کافی نیست",
//                 status: 400,
//             };
//         }
//         // P2002 = unique constraint violation. With items created via a
//         // nested `create`, this fires when @@unique([childId, date]) on
//         // OrderItem is violated — i.e. a concurrent request for the same
//         // child+date won the race between our fast-path check above and this
//         // transaction committing.
//         if (
//             error instanceof Prisma.PrismaClientKnownRequestError &&
//             error.code === "P2002"
//         ) {
//             return {
//                 ok: false,
//                 error: "برای این فرزند در یکی از تاریخ‌های انتخابی قبلا غذا رزرو شده است",
//                 status: 409,
//             };
//         }
//         throw error;
//     }
// }

// class InsufficientWalletBalanceError extends Error { }











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
import { Prisma, type OrderType, type PaymentMethod } from "@prisma/client";
import { generateTrackingCode } from "@/lib/payment/tracking-code";
import { getSmsSender } from "@/lib/sms/sms-sender";
import { orderPlacedMessage } from "@/lib/sms/templates";

export type OrderItemInput = {
    date: Date;
    menuItemId: string;
    portionType: "HALF" | "FULL";
    note?: string;
    sideIds?: string[];
};

export type CreateOrderResult =
    | { ok: true; orderId: string; totalAmount: number; status: "PENDING" | "PAID" }
    | { ok: false; error: string; status: number };

export async function createOrder(
    parentId: string,
    type: OrderType,
    childId: string,
    items: OrderItemInput[],
    now: Date = new Date(),
    paymentMethod: PaymentMethod = "GATEWAY"
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

    // Fast-path check: gives a clean error message in the common case (no
    // concurrent request). This alone does NOT close the race window — two
    // simultaneous requests could both pass this check before either
    // commits. The DB-level @@unique([childId, date]) constraint on
    // OrderItem (see schema.prisma) is what actually guarantees correctness
    // under concurrency; the try/catch below handles that constraint firing.
    const existingItemsForChild = await prisma.orderItem.findMany({
        where: { childId, date: { in: dates }, status: "ACTIVE" },
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

    // Validate any provided side/topping IDs actually exist — sides are
    // free-form optional add-ons, not tied to a specific date, so this
    // check is a flat existence check across all items' sideIds at once.
    const allSideIds = Array.from(
        new Set(items.flatMap((item) => item.sideIds ?? []))
    );
    if (allSideIds.length > 0) {
        const existingSides = await prisma.side.findMany({
            where: { id: { in: allSideIds } },
            select: { id: true },
        });
        const existingSideIdSet = new Set(existingSides.map((s) => s.id));
        const missingSideId = allSideIds.find((id) => !existingSideIdSet.has(id));
        if (missingSideId) {
            return { ok: false, error: "یکی از ضمیمه‌های انتخاب شده یافت نشد", status: 404 };
        }
    }

    const pricing = await prisma.portionPricing.findFirst();
    if (!pricing) {
        return {
            ok: false,
            error: "قیمت‌گذاری تعریف نشده است، با پشتیبانی تماس بگیرید",
            status: 500,
        };
    }

    const halfPrice = type === "DAILY" ? pricing.dailyHalfPrice : pricing.monthlyHalfPrice;
    const fullPrice = type === "DAILY" ? pricing.dailyFullPrice : pricing.monthlyFullPrice;

    const itemsWithPrice = items.map((item) => {
        const unitPrice = item.portionType === "HALF" ? halfPrice : fullPrice;
        return {
            childId,
            date: toDateOnly(item.date),
            menuItemId: item.menuItemId,
            portionType: item.portionType,
            unitPrice,
            note: item.note?.trim() || null,
            sides: item.sideIds?.length
                ? { create: item.sideIds.map((sideId) => ({ sideId })) }
                : undefined,
        };
    });

    const totalAmount = itemsWithPrice.reduce((sum, item) => sum + item.unitPrice, 0);

    try {
        // Wrapped in a transaction so the order and all its items are created
        // atomically — if the unique constraint rejects ANY item (a
        // concurrent request won the race for that child+date), the whole
        // order creation rolls back rather than leaving a partial order.
        // For WALLET payments, the balance check + debit + ledger entry all
        // happen inside this SAME transaction, so a wallet debit can never
        // succeed while the order creation fails (or vice versa).
        const order = await prisma.$transaction(async (tx) => {
            if (paymentMethod === "WALLET") {
                const user = await tx.user.findUnique({
                    where: { id: parentId },
                    select: { walletBalance: true },
                });

                if (!user || user.walletBalance < totalAmount) {
                    // Thrown (not returned) so it propagates out of the
                    // transaction and rolls back cleanly; caught below and
                    // converted into the normal discriminated-result shape.
                    throw new InsufficientWalletBalanceError();
                }

                const newBalance = user.walletBalance - totalAmount;

                await tx.user.update({
                    where: { id: parentId },
                    data: { walletBalance: newBalance },
                });

                const createdOrder = await tx.order.create({
                    data: {
                        type,
                        status: "PAID",
                        paymentMethod: "WALLET",
                        userId: parentId,
                        totalAmount,
                        trackingCode: generateTrackingCode(),
                        items: { create: itemsWithPrice },
                    },
                });

                await tx.walletTransaction.create({
                    data: {
                        userId: parentId,
                        type: "DEBIT",
                        reason: "WALLET_PAYMENT",
                        amount: totalAmount,
                        orderId: createdOrder.id,
                        balanceAfter: newBalance,
                    },
                });

                return createdOrder;
            }

            return tx.order.create({
                data: {
                    type,
                    status: "PENDING",
                    paymentMethod: "GATEWAY",
                    userId: parentId,
                    totalAmount,
                    items: { create: itemsWithPrice },
                },
            });
        });

        if (order.status === "PAID") {
            // Wallet payments are confirmed instantly — send the "order
            // placed" SMS right away (gateway orders get this from the
            // payment callback instead, once Zarinpal actually confirms).
            const user = await prisma.user.findUnique({
                where: { id: parentId },
                select: { phone: true },
            });
            if (user) {
                await getSmsSender().send(user.phone, orderPlacedMessage(totalAmount));
            }
        }

        return {
            ok: true,
            orderId: order.id,
            totalAmount,
            status: order.status as "PENDING" | "PAID",
        };
    } catch (error) {
        if (error instanceof InsufficientWalletBalanceError) {
            return {
                ok: false,
                error: "موجودی کیف پول کافی نیست",
                status: 400,
            };
        }
        // P2002 = unique constraint violation. With items created via a
        // nested `create`, this fires when @@unique([childId, date]) on
        // OrderItem is violated — i.e. a concurrent request for the same
        // child+date won the race between our fast-path check above and this
        // transaction committing.
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return {
                ok: false,
                error: "برای این فرزند در یکی از تاریخ‌های انتخابی قبلا غذا رزرو شده است",
                status: 409,
            };
        }
        throw error;
    }
}

class InsufficientWalletBalanceError extends Error { }

