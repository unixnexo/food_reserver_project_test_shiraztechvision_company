import { z } from "zod";

export const kitchenReportFilterSchema = z.object({
    schoolId: z.string().min(1, "انتخاب مدرسه الزامی است"),
    date: z.coerce.date({ error: "تاریخ نامعتبر است" }),
});

export type KitchenReportFilterInput = z.infer<typeof kitchenReportFilterSchema>;