import { z } from "zod";

export const createSideSchema = z.object({
    name: z.string().trim().min(1, "نام آیتم الزامی است"),
});

export type CreateSideInput = z.infer<typeof createSideSchema>;