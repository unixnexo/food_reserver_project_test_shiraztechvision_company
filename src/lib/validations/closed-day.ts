import { z } from "zod";

export const createClosedDaySchema = z.object({
    date: z.coerce.date({ error: "تاریخ نامعتبر است" }),
    reason: z.string().trim().optional(),
});

export type CreateClosedDayInput = z.infer<typeof createClosedDaySchema>;