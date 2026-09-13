import { z } from "zod";

export const createSchoolSchema = z.object({
    name: z.string().trim().min(1, "نام مدرسه الزامی است"),
});

export const updateSchoolSchema = z.object({
    name: z.string().trim().min(1, "نام مدرسه الزامی است"),
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;