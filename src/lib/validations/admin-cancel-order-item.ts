import { z } from "zod";

export const adminCancelOrderItemSchema = z.object({
    orderItemId: z.string().min(1, "شناسه سفارش الزامی است"),
    reason: z.string().trim().min(1, "توضیحات لغو الزامی است").max(500),
});

export type AdminCancelOrderItemInput = z.infer<typeof adminCancelOrderItemSchema>;