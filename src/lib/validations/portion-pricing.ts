import { z } from "zod";

export const updatePortionPricingSchema = z.object({
    halfPortionPrice: z
        .coerce
        .number()
        .int("قیمت باید عدد صحیح باشد")
        .positive("قیمت باید مثبت باشد"),

    fullPortionPrice: z
        .coerce
        .number()
        .int("قیمت باید عدد صحیح باشد")
        .positive("قیمت باید مثبت باشد"),
});

export type UpdatePortionPricingInput = z.infer<
    typeof updatePortionPricingSchema
>;