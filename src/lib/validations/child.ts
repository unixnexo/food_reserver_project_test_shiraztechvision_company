// src/lib/validations/child.ts

import { z } from "zod";
import { isValidNationalCode } from "./national-code";

export const genderSchema = z.enum(["MALE", "FEMALE"]);

export const createChildSchema = z.object({
    firstName: z.string().trim().min(1, "نام الزامی است"),
    lastName: z.string().trim().min(1, "نام خانوادگی الزامی است"),

    // Birthdate is submitted as an ISO date string (yyyy-mm-dd, Gregorian) —
    // the client converts from the Jalali dropdown selection before sending.
    // We store/validate as a real Date so all downstream date math (age
    // checks, sorting, etc.) works normally in Gregorian terms.
    birthDate: z.coerce.date({ error: "تاریخ تولد نامعتبر است" }),

    nationalCode: z
        .string()
        .regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد")
        .refine(isValidNationalCode, "کد ملی نامعتبر است"),

    gender: genderSchema,
    gradeId: z.string().min(1, "انتخاب مقطع تحصیلی الزامی است"),
    schoolId: z.string().min(1, "انتخاب مدرسه الزامی است"),
});

export type CreateChildInput = z.infer<typeof createChildSchema>;