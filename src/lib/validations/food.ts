import { z } from "zod";

export const createFoodSchema = z.object({
    name: z.string().trim().min(1, "نام غذا الزامی است"),
});

export type CreateFoodInput = z.infer<typeof createFoodSchema>;