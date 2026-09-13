import { z } from "zod";

export const adjustWalletSchema = z.object({
    userId: z.string().min(1, "کاربر الزامی است"),
    type: z.enum(["CREDIT", "DEBIT"]),
    amount: z.coerce
        .number()
        .int("مبلغ باید عدد صحیح باشد")
        .positive("مبلغ باید مثبت باشد"),
    note: z.string().trim().max(500).optional(),
});

export type AdjustWalletInput = z.infer<typeof adjustWalletSchema>;