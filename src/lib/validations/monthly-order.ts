// src/lib/validations/monthly-order.ts

import { z } from "zod";
import { portionTypeSchema } from "./order";

const monthlyOrderItemInputSchema = z.object({
    date: z.coerce.date({ error: "تاریخ نامعتبر است" }),
    menuItemId: z.string().min(1, "انتخاب غذا الزامی است"),
    portionType: portionTypeSchema,
    note: z.string().trim().max(300, "توضیحات نباید بیشتر از ۳۰۰ کاراکتر باشد").optional(),
    sideIds: z.array(z.string().min(1)).optional(),
});

export const createMonthlyOrderSchema = z.object({
    childId: z.string().min(1, "انتخاب فرزند الزامی است"),
    items: z
        .array(monthlyOrderItemInputSchema)
        .min(1, "حداقل یک روز باید انتخاب شود"),
    paymentMethod: z.enum(["GATEWAY", "WALLET"]).default("GATEWAY"),
});

export type CreateMonthlyOrderInput = z.infer<typeof createMonthlyOrderSchema>;