// lib/validations/auth.ts
//
// Used by both API routes (server-side, source of truth) and can be reused
// client-side in forms for instant feedback before hitting the network.

import { z } from "zod";

// Iranian mobile format: 11 digits, starts with 09. No +98 support (MVP scope).
export const phoneSchema = z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود");

export const sendOtpSchema = z.object({
    phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
    phone: phoneSchema,
    code: z.string().regex(/^\d{5}$/, "کد تایید باید ۵ رقم باشد"),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;