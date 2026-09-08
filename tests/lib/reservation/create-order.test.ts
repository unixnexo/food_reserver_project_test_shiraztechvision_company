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
        $transaction: vi.fn(),
    },
}));

import { prisma } from "@/lib/prisma";

const PARENT_ID = "parent-1";
const CHILD_ID = "child-1";
const MENU_ITEM_ID = "menu-item-1";

// A Monday well inside the earliest-bookable window, per cutoff rules.
const VALID_DATE = new Date(Date.UTC(2026, 8, 14)); // 2026-09-14, a Monday

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
        halfPortionPrice: 680_000,
        fullPortionPrice: 790_000,
    });
    (prisma.order.create as any).mockResolvedValue({
        id: "order-1",
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
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, []);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(400);
    });

    it("rejects when the child does not belong to the requesting parent", async () => {
        (prisma.child.findUnique as any).mockResolvedValue({
            id: CHILD_ID,
            parentId: "someone-else",
        });
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(404);
    });

    it("rejects when the child does not exist", async () => {
        (prisma.child.findUnique as any).mockResolvedValue(null);
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(404);
    });

    it("rejects when a menu item does not exist", async () => {
        (prisma.menuItem.findMany as any).mockResolvedValue([]);
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(404);
    });

    it("rejects when a menu item's date does not match the claimed date", async () => {
        const wrongDate = new Date(Date.UTC(2026, 8, 15));
        (prisma.menuItem.findMany as any).mockResolvedValue([
            { id: MENU_ITEM_ID, date: wrongDate, foodId: "food-1" },
        ]);
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(400);
    });

    it("rejects when the child already has a reservation on that date (system-wide)", async () => {
        (prisma.orderItem.findMany as any).mockResolvedValue([
            { date: VALID_DATE },
        ]);
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(409);
    });

    it("rejects when portion pricing is not configured", async () => {
        (prisma.portionPricing.findFirst as any).mockResolvedValue(null);
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(500);
    });

    it("succeeds with valid input and snapshots the correct price", async () => {
        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.totalAmount).toBe(790_000); // FULL portion price
            expect(result.orderId).toBe("order-1");
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

        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, items);
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

        const result = await createOrder(PARENT_ID, "DAILY", CHILD_ID, validItems);
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