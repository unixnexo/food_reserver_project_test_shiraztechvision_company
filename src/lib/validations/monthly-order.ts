// src/lib/validations/monthly-order.ts

import { z } from "zod";
import { portionTypeSchema } from "./order";

const monthlyOrderItemInputSchema = z.object({
    date: z.coerce.date({ error: "تاریخ نامعتبر است" }),
    menuItemId: z.string().min(1, "انتخاب غذا الزامی است"),
    portionType: portionTypeSchema,
});

export const createMonthlyOrderSchema = z.object({
    childId: z.string().min(1, "انتخاب فرزند الزامی است"),
    items: z
        .array(monthlyOrderItemInputSchema)
        .min(1, "حداقل یک روز باید انتخاب شود"),
});

export type CreateMonthlyOrderInput = z.infer<typeof createMonthlyOrderSchema>;