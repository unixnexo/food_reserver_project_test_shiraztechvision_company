// src/lib/validations/national-code.ts
//
// Validates Iranian national codes (کد ملی) using the real checksum
// algorithm, not just a "10 digits" format check. This catches typos and
// obviously-fake codes.
//
// ALGORITHM:
// - The code is 10 digits: d1 d2 ... d9 c (c = check digit)
// - weighted sum = sum(di * (10 - i)) for i = 1..9
// - remainder = weighted sum % 11
// - if remainder < 2: check digit must equal remainder
// - else: check digit must equal (11 - remainder)
//
// Also rejects the common "all same digit" fake pattern (e.g. 0000000000,
// 1111111111), which passes the checksum math by coincidence but is never
// a real issued code.

export function isValidNationalCode(code: string): boolean {
    if (!/^\d{10}$/.test(code)) return false;

    // Reject all-same-digit codes (e.g. "1111111111") — mathematically valid
    // under the checksum but never actually issued.
    if (/^(\d)\1{9}$/.test(code)) return false;

    const digits = code.split("").map(Number);
    const checkDigit = digits[9];

    const weightedSum = digits
        .slice(0, 9)
        .reduce((sum, digit, index) => sum + digit * (10 - index), 0);

    const remainder = weightedSum % 11;

    if (remainder < 2) {
        return checkDigit === remainder;
    }

    return checkDigit === 11 - remainder;
}