// lib/otp/sender.ts
//
// Thin wrapper kept for backward-compat call sites (`sendOtp(phone, code)`)
// — delegates to the shared SMS sender in src/lib/sms/sms-sender.ts so
// there's exactly one place that talks to an actual SMS provider once one
// is integrated.

import { getSmsSender } from "@/lib/sms/sms-sender";
import { otpMessage } from "@/lib/sms/templates";

export async function sendOtp(phone: string, code: string): Promise<void> {
    await getSmsSender().send(phone, otpMessage(code));
}