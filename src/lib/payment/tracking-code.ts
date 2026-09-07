// src/lib/payment/tracking-code.ts
//
// Generates a short, human-friendly tracking code shown to the parent
// after a successful payment (separate from Zarinpal's numeric ref_id —
// this stays stable even if the payment gateway is swapped out later).
// Format: 10 uppercase alphanumeric characters, e.g. "K3F9X2M8QZ".

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
const LENGTH = 10;

export function generateTrackingCode(): string {
    let code = "";
    for (let i = 0; i < LENGTH; i++) {
        code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    return code;
}