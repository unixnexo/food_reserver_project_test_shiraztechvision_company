// tests/lib/reservation/edit-order-item.test.ts
//
// Tests the core edit-order-item logic (swapping which food is booked
// for an already-placed reservation). Mocks Prisma entirely, same
// approach as create-order.test.ts / cancel-order-item.test.ts.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { editOrderItem } from "@/lib/reservation/edit-order-item";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        orderItem: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        menuItem: { findUnique: vi.fn() },
    },
}));

import { prisma } from "@/lib/prisma";

const ITEM_ID = "item-1";
const CURRENT_MENU_ITEM_ID = "menu-item-current";
const NEW_MENU_ITEM_ID = "menu-item-new";
const ITEM_DATE = new Date(Date.UTC(2026, 8, 14));

function mockDefaults(overrides: {
    itemStatus?: "ACTIVE" | "CANCELLED";
    orderStatus?: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
    newMenuItemDate?: Date | null;
} = {}) {
    const {
        itemStatus = "ACTIVE",
        orderStatus = "PAID",
        newMenuItemDate = ITEM_DATE,
    } = overrides;

    (prisma.orderItem.findUnique as any).mockResolvedValue({
        id: ITEM_ID,
        menuItemId: CURRENT_MENU_ITEM_ID,
        date: ITEM_DATE,
        status: itemStatus,
        order: {
            status: orderStatus,
            user: { phone: "09120000000" },
        },
    });

    (prisma.menuItem.findUnique as any).mockResolvedValue(
        newMenuItemDate === null
            ? null
            : { id: NEW_MENU_ITEM_ID, date: newMenuItemDate, foodId: "food-2" }
    );

    (prisma.orderItem.update as any).mockResolvedValue({});
}

describe("editOrderItem", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects when the item does not exist", async () => {
        (prisma.orderItem.findUnique as any).mockResolvedValue(null);
        const result = await editOrderItem(ITEM_ID, NEW_MENU_ITEM_ID);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(404);
    });

    it("rejects when the item is already cancelled", async () => {
        mockDefaults({ itemStatus: "CANCELLED" });
        const result = await editOrderItem(ITEM_ID, NEW_MENU_ITEM_ID);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(400);
    });

    it("rejects when the order was never paid", async () => {
        mockDefaults({ orderStatus: "PENDING" });
        const result = await editOrderItem(ITEM_ID, NEW_MENU_ITEM_ID);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(400);
    });

    it("rejects when the new menu item does not exist", async () => {
        mockDefaults({ newMenuItemDate: null });
        const result = await editOrderItem(ITEM_ID, NEW_MENU_ITEM_ID);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(404);
    });

    it("rejects when the new menu item is for a different date", async () => {
        const wrongDate = new Date(Date.UTC(2026, 8, 15));
        mockDefaults({ newMenuItemDate: wrongDate });
        const result = await editOrderItem(ITEM_ID, NEW_MENU_ITEM_ID);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(400);
    });

    it("succeeds and updates the menuItemId when the new food is valid for the same date", async () => {
        mockDefaults();

        const result = await editOrderItem(ITEM_ID, NEW_MENU_ITEM_ID);

        expect(result.ok).toBe(true);
        expect(prisma.orderItem.update).toHaveBeenCalledWith({
            where: { id: ITEM_ID },
            data: { menuItemId: NEW_MENU_ITEM_ID },
        });
    });

    it("is a no-op (does not hit the DB) when the same food is re-selected", async () => {
        (prisma.orderItem.findUnique as any).mockResolvedValue({
            id: ITEM_ID,
            menuItemId: CURRENT_MENU_ITEM_ID,
            date: ITEM_DATE,
            status: "ACTIVE",
            order: { status: "PAID", user: { phone: "09120000000" } },
        });
        (prisma.menuItem.findUnique as any).mockResolvedValue({
            id: CURRENT_MENU_ITEM_ID,
            date: ITEM_DATE,
            foodId: "food-1",
        });

        const result = await editOrderItem(ITEM_ID, CURRENT_MENU_ITEM_ID);

        expect(result.ok).toBe(true);
        expect(prisma.orderItem.update).not.toHaveBeenCalled();
    });
});