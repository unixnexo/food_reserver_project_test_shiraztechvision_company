// lib/otp/generate.ts
//
// Generates a random 5-digit OTP code and provides hash/verify helpers.
// We hash the code before storing it (like a password) so that a DB leak
// doesn't expose active OTP codes in plain text.

import bcrypt from "bcryptjs";

const OTP_LENGTH = 5;
const SALT_ROUNDS = 10;

/** Generates a random N-digit numeric code as a string, e.g. "48213". */
export function generateOtpCode(): string {
    const min = 10 ** (OTP_LENGTH - 1);
    const max = 10 ** OTP_LENGTH - 1;
    const code = Math.floor(min + Math.random() * (max - min + 1));
    return code.toString();
}

/** Hashes a plain OTP code for storage. */
export async function hashOtpCode(code: string): Promise<string> {
    return bcrypt.hash(code, SALT_ROUNDS);
}

/** Compares a plain OTP code (user input) against the stored hash. */
export async function verifyOtpCode(
    plainCode: string,
    hashedCode: string
): Promise<boolean> {
    return bcrypt.compare(plainCode, hashedCode);
}