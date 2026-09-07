// src/lib/validations/order.ts

import { z } from "zod";

export const portionTypeSchema = z.enum(["HALF", "FULL"]);

const orderItemInputSchema = z.object({
    date: z.coerce.date({ error: "تاریخ نامعتبر است" }),
    menuItemId: z.string().min(1, "انتخاب غذا الزامی است"),
    portionType: portionTypeSchema,
});

export const createDailyOrderSchema = z.object({
    childId: z.string().min(1, "انتخاب فرزند الزامی است"),
    items: z
        .array(orderItemInputSchema)
        .min(1, "حداقل یک روز باید انتخاب شود"),
});

export type CreateDailyOrderInput = z.infer<typeof createDailyOrderSchema>;