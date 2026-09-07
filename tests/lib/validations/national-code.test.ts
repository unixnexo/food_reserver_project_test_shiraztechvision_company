// src/test/lib/validations/national-code.test.ts

import { describe, it, expect } from "vitest";
import { isValidNationalCode } from "@/lib/validations/national-code";

describe("isValidNationalCode", () => {
    it("accepts a known-valid national code", () => {
        // 0499370899 is a commonly-cited valid test national code
        expect(isValidNationalCode("0499370899")).toBe(true);
    });

    it("rejects a code with an incorrect check digit", () => {
        expect(isValidNationalCode("0499370890")).toBe(false);
    });

    it("rejects a code that is not 10 digits", () => {
        expect(isValidNationalCode("12345")).toBe(false);
    });

    it("rejects a code with non-digit characters", () => {
        expect(isValidNationalCode("049937089a")).toBe(false);
    });

    it("rejects all-same-digit codes despite passing checksum math", () => {
        expect(isValidNationalCode("0000000000")).toBe(false);
        expect(isValidNationalCode("1111111111")).toBe(false);
    });
});