// test/lib/otp/generate.test.ts

import { describe, it, expect } from "vitest";
import { generateOtpCode, hashOtpCode, verifyOtpCode } from "@/lib/otp/generate";

describe("generateOtpCode", () => {
    it("generates a 5-digit numeric string", () => {
        const code = generateOtpCode();
        expect(code).toMatch(/^\d{5}$/);
    });

    it("generates different codes across calls (probabilistically)", () => {
        const codes = new Set(Array.from({ length: 20 }, () => generateOtpCode()));
        // Not a strict guarantee, but 20 draws from 90000 possibilities colliding
        // enough to fail this would be extraordinarily unlucky.
        expect(codes.size).toBeGreaterThan(1);
    });
});

describe("hashOtpCode / verifyOtpCode", () => {
    it("verifies a correct code against its hash", async () => {
        const code = "48213";
        const hashed = await hashOtpCode(code);
        const isValid = await verifyOtpCode(code, hashed);
        expect(isValid).toBe(true);
    });

    it("rejects an incorrect code against a hash", async () => {
        const hashed = await hashOtpCode("48213");
        const isValid = await verifyOtpCode("00000", hashed);
        expect(isValid).toBe(false);
    });

    it("produces a different hash each time (salted)", async () => {
        const code = "48213";
        const hash1 = await hashOtpCode(code);
        const hash2 = await hashOtpCode(code);
        expect(hash1).not.toBe(hash2);
    });
});