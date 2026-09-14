import { z } from "zod";

export const cancelOrderItemSchema = z.object({
    orderItemId: z.string().min(1, "شناسه سفارش الزامی است"),
});

export type CancelOrderItemInput = z.infer<typeof cancelOrderItemSchema>;