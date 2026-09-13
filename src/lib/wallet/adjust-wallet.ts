// src/lib/wallet/adjust-wallet.ts
//
// Single shared entry point for every wallet balance mutation in the
// system (admin manual add/deduct, order-cancellation refunds, and later
// wallet-as-payment-method debits). Centralizing this in one place means
// there's exactly one spot that:
//   1. Updates User.walletBalance
//   2. Writes the corresponding WalletTransaction ledger row
//   3. Enforces the balance can never go negative
//   4. Does both writes atomically (same DB transaction), so the
//      denormalized balance and the ledger can never drift apart
//
// Callers that are already inside their own `prisma.$transaction` (e.g.
// "cancel order -> refund" needs the order-status update and the wallet
// credit to succeed or fail together) should pass that transaction client
// in as `tx` instead of letting this function open its own.

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { WalletTransactionType, WalletTransactionReason } from "@prisma/client";

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export type AdjustWalletInput = {
    userId: string;
    type: WalletTransactionType; // CREDIT | DEBIT
    reason: WalletTransactionReason;
    amount: number; // always positive
    note?: string | null;
    adminId?: string | null;
    orderId?: string | null;
};

export type AdjustWalletResult =
    | { ok: true; newBalance: number; transactionId: string }
    | { ok: false; error: string };

export async function adjustWallet(
    input: AdjustWalletInput,
    tx: PrismaClientOrTx = prisma
): Promise<AdjustWalletResult> {
    if (input.amount <= 0 || !Number.isInteger(input.amount)) {
        return { ok: false, error: "مبلغ باید عدد صحیح و مثبت باشد" };
    }

    const run = async (client: PrismaClientOrTx) => {
        const user = await client.user.findUnique({
            where: { id: input.userId },
            select: { walletBalance: true },
        });

        if (!user) {
            return { ok: false as const, error: "کاربر یافت نشد" };
        }

        const delta = input.type === "CREDIT" ? input.amount : -input.amount;
        const newBalance = user.walletBalance + delta;

        if (newBalance < 0) {
            return {
                ok: false as const,
                error: "موجودی کیف پول کافی نیست",
            };
        }

        await client.user.update({
            where: { id: input.userId },
            data: { walletBalance: newBalance },
        });

        const transaction = await client.walletTransaction.create({
            data: {
                userId: input.userId,
                type: input.type,
                reason: input.reason,
                amount: input.amount,
                note: input.note ?? null,
                adminId: input.adminId ?? null,
                orderId: input.orderId ?? null,
                balanceAfter: newBalance,
            },
        });

        return {
            ok: true as const,
            newBalance,
            transactionId: transaction.id,
        };
    };

    // If the caller passed a transaction client, we're already inside a
    // transaction (e.g. order-cancellation flow) — just run inline so
    // this becomes part of that atomic unit rather than opening a nested
    // one (Prisma doesn't support nested $transaction calls).
    if (tx !== prisma) {
        return run(tx);
    }

    return prisma.$transaction((txClient) => run(txClient));
}