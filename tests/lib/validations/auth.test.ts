// test/lib/validations/auth.test.ts
//
// Tests the Zod schemas guarding OTP auth input. These run with zero
// dependencies (no DB, no network) — pure input validation logic, which is
// exactly the kind of business rule that should never regress silently.

import { describe, it, expect } from "vitest";
import { phoneSchema, sendOtpSchema, verifyOtpSchema } from "@/lib/validations/auth";

describe("phoneSchema", () => {
    it("accepts a valid Iranian mobile number", () => {
        expect(phoneSchema.safeParse("09121234567").success).toBe(true);
    });

    it("rejects a number not starting with 09", () => {
        expect(phoneSchema.safeParse("08121234567").success).toBe(false);
    });

    it("rejects a number that is too short", () => {
        expect(phoneSchema.safeParse("0912123456").success).toBe(false);
    });

    it("rejects a number that is too long", () => {
        expect(phoneSchema.safeParse("091212345678").success).toBe(false);
    });

    it("rejects a number with an international prefix", () => {
        expect(phoneSchema.safeParse("+989121234567").success).toBe(false);
    });

    it("rejects non-numeric input", () => {
        expect(phoneSchema.safeParse("0912abc4567").success).toBe(false);
    });
});

describe("sendOtpSchema", () => {
    it("accepts a valid payload", () => {
        const result = sendOtpSchema.safeParse({ phone: "09121234567" });
        expect(result.success).toBe(true);
    });

    it("rejects a missing phone field", () => {
        const result = sendOtpSchema.safeParse({});
        expect(result.success).toBe(false);
    });
});

describe("verifyOtpSchema", () => {
    it("accepts a valid phone + 5-digit code", () => {
        const result = verifyOtpSchema.safeParse({
            phone: "09121234567",
            code: "12345",
        });
        expect(result.success).toBe(true);
    });

    it("rejects a code shorter than 5 digits", () => {
        const result = verifyOtpSchema.safeParse({
            phone: "09121234567",
            code: "1234",
        });
        expect(result.success).toBe(false);
    });

    it("rejects a code longer than 5 digits", () => {
        const result = verifyOtpSchema.safeParse({
            phone: "09121234567",
            code: "123456",
        });
        expect(result.success).toBe(false);
    });

    it("rejects a non-numeric code", () => {
        const result = verifyOtpSchema.safeParse({
            phone: "09121234567",
            code: "12a45",
        });
        expect(result.success).toBe(false);
    });
});