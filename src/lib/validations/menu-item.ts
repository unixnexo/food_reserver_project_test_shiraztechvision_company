import { z } from "zod";

export const createMenuItemSchema = z.object({
    date: z.coerce.date({ error: "تاریخ نامعتبر است" }),
    foodId: z.string().min(1, "انتخاب غذا الزامی است"),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;