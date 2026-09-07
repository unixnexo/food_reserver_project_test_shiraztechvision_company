// lib/otp/sender.ts
//
// PLACEHOLDER for SMS delivery. Currently just logs the OTP code to the
// server console so development/testing can proceed without a real SMS
// panel account.
//
// TO INTEGRATE A REAL SMS PANEL LATER:
// Replace the body of this function with the actual API call to your SMS
// provider (e.g. Kavenegar, IPPanel, etc). The function signature should
// stay the same so nothing else in the codebase needs to change — every
// caller just does `await sendOtp(phone, code)`.

export async function sendOtp(phone: string, code: string): Promise<void> {
    console.log(`[OTP] Sending code ${code} to ${phone}`);
    // TODO: replace with real SMS panel integration
}