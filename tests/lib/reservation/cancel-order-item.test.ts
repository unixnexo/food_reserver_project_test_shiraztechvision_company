// tests/lib/reservation/cancel-order-item.test.ts
//
// Tests the shared cancel-order-item core (used by both the parent
// self-cancel route and the future admin-cancel route). Mocks Prisma
// entirely, same approach as create-order.test.ts.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { cancelOrderItem } from "@/lib/reservation/cancel-order-item";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        orderItem: {
            findUnique: vi.fn(),
            update: vi.fn(),
            count: vi.fn(),
        },
        order: { update: vi.fn() },
        user: { findUnique: vi.fn(), update: vi.fn() },
        walletTransaction: { create: vi.fn() },
        $transaction: vi.fn(),
    },
}));

import { prisma } from "@/lib/prisma";

const ITEM_ID = "item-1";
const ORDER_ID = "order-1";
const USER_ID = "parent-1";

function mockDefaults(overrides: {
    itemStatus?: "ACTIVE" | "CANCELLED";
    orderStatus?: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
    unitPrice?: number;
    walletBalance?: number;
    remainingActiveCount?: number;
} = {}) {
    const {
        itemStatus = "ACTIVE",
        orderStatus = "PAID",
        unitPrice = 500_000,
        walletBalance = 200_000,
        remainingActiveCount = 1,
    } = overrides;

    (prisma.orderItem.findUnique as any).mockResolvedValue({
        id: ITEM_ID,
        orderId: ORDER_ID,
        status: itemStatus,
        unitPrice,
        order: {
            id: ORDER_ID,
            userId: USER_ID,
            status: orderStatus,
            user: { id: USER_ID, phone: "09120000000" },
        },
    });

    (prisma.orderItem.update as any).mockResolvedValue({});
    (prisma.orderItem.count as any).mockResolvedValue(remainingActiveCount);
    (prisma.order.update as any).mockResolvedValue({});
    (prisma.user.findUnique as any).mockResolvedValue({ walletBalance });
    (prisma.user.update as any).mockResolvedValue({});
    (prisma.walletTransaction.create as any).mockResolvedValue({ id: "tx-1" });

    (prisma.$transaction as any).mockImplementation(async (fn: any) => fn(prisma));
}

describe("cancelOrderItem", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects when the item does not exist", async () => {
        (prisma.orderItem.findUnique as any).mockResolvedValue(null);
        const result = await cancelOrderItem(ITEM_ID, "test reason", USER_ID);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(404);
    });

    it("rejects when the item is already cancelled", async () => {
        mockDefaults({ itemStatus: "CANCELLED" });
        const result = await cancelOrderItem(ITEM_ID, "test reason", USER_ID);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.status).toBe(400);
    });

    it("refunds the wallet when the order was PAID", async () => {
        mockDefaults({ orderStatus: "PAID", unitPrice: 500_000, walletBalance: 200_000 });

        const result = await cancelOrderItem(ITEM_ID, "درخواست والد", USER_ID);

        expect(result.ok).toBe(true);
        if (result.ok) expect(result.refundedAmount).toBe(500_000);

        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: USER_ID },
            data: { walletBalance: 200_000 + 500_000 },
        });

        expect(prisma.walletTransaction.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    userId: USER_ID,
                    type: "CREDIT",
                    reason: "ORDER_REFUND",
                    amount: 500_000,
                    orderId: ORDER_ID,
                }),
            })
        );
    });

    it("does NOT refund when the order was never paid (PENDING)", async () => {
        mockDefaults({ orderStatus: "PENDING" });

        const result = await cancelOrderItem(ITEM_ID, "درخواست والد", USER_ID);

        expect(result.ok).toBe(true);
        if (result.ok) expect(result.refundedAmount).toBe(0);

        expect(prisma.user.update).not.toHaveBeenCalled();
        expect(prisma.walletTransaction.create).not.toHaveBeenCalled();
    });

    it("marks the item CANCELLED with the reason and canceller id", async () => {
        mockDefaults();

        await cancelOrderItem(ITEM_ID, "دلیل لغو", USER_ID);

        expect(prisma.orderItem.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: ITEM_ID },
                data: expect.objectContaining({
                    status: "CANCELLED",
                    cancelReason: "دلیل لغو",
                    cancelledBy: USER_ID,
                }),
            })
        );
    });

    it("cancels the whole order when no ACTIVE items remain", async () => {
        mockDefaults({ remainingActiveCount: 0 });

        await cancelOrderItem(ITEM_ID, "دلیل لغو", USER_ID);

        expect(prisma.order.update).toHaveBeenCalledWith({
            where: { id: ORDER_ID },
            data: { status: "CANCELLED" },
        });
    });

    it("leaves the order alone when other ACTIVE items remain", async () => {
        mockDefaults({ remainingActiveCount: 2 });

        await cancelOrderItem(ITEM_ID, "دلیل لغو", USER_ID);

        expect(prisma.order.update).not.toHaveBeenCalled();
    });
});