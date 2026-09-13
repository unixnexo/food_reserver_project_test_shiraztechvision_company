import { z } from "zod";

export const updatePortionPricingSchema = z.object({
    dailyHalfPrice: z.coerce.number().int("قیمت باید عدد صحیح باشد").positive("قیمت باید مثبت باشد"),
    dailyFullPrice: z.coerce.number().int("قیمت باید عدد صحیح باشد").positive("قیمت باید مثبت باشد"),
    monthlyHalfPrice: z.coerce.number().int("قیمت باید عدد صحیح باشد").positive("قیمت باید مثبت باشد"),
    monthlyFullPrice: z.coerce.number().int("قیمت باید عدد صحیح باشد").positive("قیمت باید مثبت باشد"),
});

export type UpdatePortionPricingInput = z.infer<typeof updatePortionPricingSchema>;