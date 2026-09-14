import { z } from "zod";

export const editOrderItemSchema = z.object({
    orderItemId: z.string().min(1, "شناسه سفارش الزامی است"),
    newMenuItemId: z.string().min(1, "انتخاب غذا الزامی است"),
});

export type EditOrderItemInput = z.infer<typeof editOrderItemSchema>;