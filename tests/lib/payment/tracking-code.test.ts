// src/test/lib/payment/tracking-code.test.ts

import { describe, it, expect } from "vitest";
import { generateTrackingCode } from "@/lib/payment/tracking-code";

describe("generateTrackingCode", () => {
    it("generates a 10-character code", () => {
        expect(generateTrackingCode()).toHaveLength(10);
    });

    it("only uses unambiguous uppercase alphanumeric characters", () => {
        const code = generateTrackingCode();
        expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/);
    });

    it("excludes visually confusing characters (0, O, 1, I)", () => {
        const codes = Array.from({ length: 50 }, () => generateTrackingCode());
        const combined = codes.join("");
        expect(combined).not.toMatch(/[0O1I]/);
    });

    it("generates different codes across calls (probabilistically)", () => {
        const codes = new Set(Array.from({ length: 20 }, () => generateTrackingCode()));
        expect(codes.size).toBeGreaterThan(1);
    });
});