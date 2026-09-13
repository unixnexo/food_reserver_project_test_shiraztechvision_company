// src/test/lib/reservation/create-order.test.ts
//
// Tests the core order-creation business rules by mocking the Prisma
// client — this keeps the suite fast and DB-independent while still
// exercising the actual decision logic (ownership check, date validity,
// menu-item validity, duplicate-day check, price snapshotting).
//
// NOTE: this mocks `@/lib/prisma` entirely. If the Prisma client shape
// changes (new query patterns added to create-order.ts), these mocks need
// matching updates — that's an expected maintenance cost of this
// approach, traded for not needing a real test database in CI.
//
// IMPORTANT: `createOrder` defaults `now` to `new Date()` (the real
// system clock) when not passed explicitly. VALID_DATE below is only
// "tomorrow" relative to a specific moment, so every test that exercises
// the happy path (or anything past the date-validity check) MUST pass an
// explicit `NOW` that keeps VALID_DATE inside the bookable window —
// otherwise the suite silently starts failing once the real calendar
// date catches up to/passes VALID_DATE. Never rely on the default clock
// in this file.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createOrder } from "@/lib/reservation/create-order";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        child: { findUnique: vi.fn() },
        closedDay: { findMany: vi.fn() },
        menuItem: { findMany: vi.fn() },
        orderItem: { findMany: vi.fn() },
        portionPricing: { findFirst: vi.fn() },
        order: { create: vi.fn() },
        user: { findUnique: vi.fn(), update: vi.fn() },
        walletTransaction: { create: vi.fn() },
        $transaction: vi.fn(),
    },
}));

import { prisma } from "@/lib/prisma";

const PARENT_ID = "parent-1";
const CHILD_ID = "child-1";
const MENU_ITEM_ID = "menu-item-1";

// Fixed "now" used by every test unless a test deliberately overrides it.
// 2026-09-13, 14:00 Iran time — well before the 5pm cutoff, so "tomorrow"
// (VALID_DATE) is bookable and still inside the current Jalali month.
const NOW = new Date(Date.UTC(2026, 8, 13, 10, 30)); // 10:30 UTC = 14:00 Iran (UTC+3:30)

// The "tomorrow" relative to NOW, per cutoff rules — a Monday.
const VALID_DATE = new Date(Date.UTC(2026, 8, 14)); // 2026-09-14

function mockDefaults() {
    (prisma.child.findUnique as any).mockResolvedValue({
        id: CHILD_ID,
        parentId: PARENT_ID,
    });
    (prisma.closedDay.findMany as any).mockResolvedValue([]);
    (prisma.menuItem.findMany as any).mockResolvedValue([
        { id: MENU_ITEM_ID, date: VALID_DATE, foodId: "food-1" },
    ]);
    (prisma.orderItem.findMany as any).mockResolvedValue([]);
    (prisma.portionPricing.findFirst as any).mockResolvedValue({
        dailyHalfPrice: 680_000,
        dailyFullPrice: 790_000,
        monthlyHalfPrice: 650_000,
        monthlyFullPrice: 760_000,
    });
    (prisma.order.create as any).mockResolvedValue({
        id: "order-1",
        status: "PENDING",
    });
    (prisma.$transaction as any).mockImplementation(async (fn: any) =>
        fn(prisma)
    );
}

describe("createOrder", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockDefaults();
    });

    const validItems = [
        { date: VALID_DATE, menuItemId: MENU_ITEM_ID, portionType: "FULL" as const },
    ];

    it("rejects when no items are provided", async () => {
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, [], NOW);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(400);
    });

    it("rejects when the child does not belong to the requesting parent", async () => {
        (prisma.child.findUnique as any).mockResolvedValue({
            id: CHILD_ID,
            parentId: "someone-else",
        });
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems, NOW);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(404);
    });

    it("rejects when the child does not exist", async () => {
        (prisma.child.findUnique as any).mockResolvedValue(null);
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems, NOW);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(404);
    });

    it("rejects when a menu item does not exist", async () => {
        (prisma.menuItem.findMany as any).mockResolvedValue([]);
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems, NOW);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(404);
    });

    it("rejects when a menu item's date does not match the claimed date", async () => {
        const wrongDate = new Date(Date.UTC(2026, 8, 15));
        (prisma.menuItem.findMany as any).mockResolvedValue([
            { id: MENU_ITEM_ID, date: wrongDate, foodId: "food-1" },
        ]);
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems, NOW);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(400);
    });

    it("rejects when the child already has a reservation on that date (system-wide)", async () => {
        (prisma.orderItem.findMany as any).mockResolvedValue([
            { date: VALID_DATE },
        ]);
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems, NOW);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(409);
    });

    it("rejects when portion pricing is not configured", async () => {
        (prisma.portionPricing.findFirst as any).mockResolvedValue(null);
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems, NOW);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(500);
    });

    it("succeeds with valid input and snapshots the correct price", async () => {
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.totalAmount).toBe(790_000); // FULL portion price
            expect(result.orderId).toBe("order-1");
            expect(result.status).toBe("PENDING");
        }
    });

    it("sums totalAmount correctly across multiple items", async () => {
        const secondDate = new Date(Date.UTC(2026, 8, 15));
        const secondMenuItemId = "menu-item-2";
        (prisma.menuItem.findMany as any).mockResolvedValue([
            { id: MENU_ITEM_ID, date: VALID_DATE, foodId: "food-1" },
            { id: secondMenuItemId, date: secondDate, foodId: "food-2" },
        ]);

        const items = [
            { date: VALID_DATE, menuItemId: MENU_ITEM_ID, portionType: "FULL" as const },
            { date: secondDate, menuItemId: secondMenuItemId, portionType: "HALF" as const },
        ];

        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, items, NOW);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.totalAmount).toBe(790_000 + 680_000);
        }
    });

    it("rejects with a 409 when the DB unique constraint fires (simulated race condition)", async () => {
        const { Prisma } = await import("@prisma/client");
        const constraintError = new Prisma.PrismaClientKnownRequestError(
            "Unique constraint failed",
            { code: "P2002", clientVersion: "test" }
        );
        (prisma.$transaction as any).mockRejectedValue(constraintError);

        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems, NOW);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(409);
    });

    it("rejects a DAILY reservation for a date outside the current month", async () => {
        const nextMonthDate = new Date(Date.UTC(2026, 9, 5)); // October, next month
        (prisma.menuItem.findMany as any).mockResolvedValue([
            { id: MENU_ITEM_ID, date: nextMonthDate, foodId: "food-1" },
        ]);
        const items = [
            { date: nextMonthDate, menuItemId: MENU_ITEM_ID, portionType: "FULL" as const },
        ];
        const result = await createOrder(
            PARENT_ID,
            "DAILY",
            CHILD_ID,
            items,
            new Date(2026, 8, 7, 14, 0) // "now" = Sep 7, before cutoff
        );
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(400);
    });
});

describe("createOrder — WALLET payment", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockDefaults();
    });

    const validItems = [
        { date: VALID_DATE, menuItemId: MENU_ITEM_ID, portionType: "FULL" as const },
    ];

    it("succeeds and debits the wallet when balance is sufficient", async () => {
        (prisma.user.findUnique as any)
            .mockResolvedValueOnce({ walletBalance: 1_000_000 }) // balance check inside the tx
            .mockResolvedValueOnce({ phone: "09120000000" }); // post-tx phone lookup for the SMS
        (prisma.user.update as any).mockResolvedValue({});
        (prisma.order.create as any).mockResolvedValue({
            id: "order-wallet-1",
            status: "PAID",
        });
        (prisma.walletTransaction.create as any).mockResolvedValue({
            id: "wallet-tx-1",
        });

        const result = await createOrder(
            PARENT_ID,
            "DAILY",
            CHILD_ID,
            validItems,
            NOW,
            "WALLET"
        );

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.status).toBe("PAID");
            expect(result.totalAmount).toBe(790_000);
        }

        // Balance debited by exactly the order total.
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: PARENT_ID },
            data: { walletBalance: 1_000_000 - 790_000 },
        });

        // Ledger entry written with the right reason/direction.
        expect(prisma.walletTransaction.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    userId: PARENT_ID,
                    type: "DEBIT",
                    reason: "WALLET_PAYMENT",
                    amount: 790_000,
                    orderId: "order-wallet-1",
                    balanceAfter: 1_000_000 - 790_000,
                }),
            })
        );
    });

    it("rejects with a 400 when wallet balance is insufficient", async () => {
        (prisma.user.findUnique as any).mockResolvedValue({
            walletBalance: 100_000, // less than the 790,000 order total
        });

        const result = await createOrder(
            PARENT_ID,
            "DAILY",
            CHILD_ID,
            validItems,
            NOW,
            "WALLET"
        );

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.status).toBe(400);
            expect(result.error).toContain("موجودی");
        }

        // Balance must NOT be touched when the debit is rejected.
        expect(prisma.user.update).not.toHaveBeenCalled();
        expect(prisma.walletTransaction.create).not.toHaveBeenCalled();
    });

    it("rejects with a 400 when the user record is missing", async () => {
        (prisma.user.findUnique as any).mockResolvedValue(null);

        const result = await createOrder(
            PARENT_ID,
            "DAILY",
            CHILD_ID,
            validItems,
            NOW,
            "WALLET"
        );

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(400);
    });
});