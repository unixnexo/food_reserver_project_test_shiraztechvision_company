// src/lib/reservation/create-daily-order.ts
//
// Thin DAILY-specific wrapper around the shared lib/reservation/create-order.ts
// logic. Kept as a separate named function (rather than inlining the call
// in the API route) so existing imports/tests referencing
// `createDailyOrder` continue to work unchanged.

import { createOrder, type CreateOrderResult } from "./create-order";
import type { CreateDailyOrderInput } from "@/lib/validations/order";

export type CreateDailyOrderResult = CreateOrderResult;

export async function createDailyOrder(
    parentId: string,
    input: CreateDailyOrderInput,
    now: Date = new Date()
): Promise<CreateDailyOrderResult> {
    return createOrder(parentId, "DAILY", input.childId, input.items, now);
}