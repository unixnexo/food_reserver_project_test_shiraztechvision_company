// app/api/auth/send-otp/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Entry point for both login AND implicit registration — if the phone
// number doesn't exist yet, a new User (role: PARENT) is created here.
// There is no separate "sign up" endpoint; a phone number becomes a user
// the first time it requests an OTP.
//
// REQUEST BODY (JSON):
//   { "phone": "09121234567" }
//
// RESPONSE (200):
//   { "success": true, "message": "کد تایید ارسال شد" }
//
// RESPONSE (400) — validation error:
//   { "success": false, "error": "<Persian validation message>" }
//
// RESPONSE (429) — resend cooldown not yet elapsed:
//   { "success": false, "error": "لطفا ۲ دقیقه صبر کنید", "retryAfterSeconds": <number> }
//
// BUSINESS RULES ENFORCED HERE:
// - OTP code is 5 digits, expires 5 minutes after being sent.
// - Resend is blocked for 2 minutes after the previous send (tracked via
//   `otpLastSentAt` on the User row — this is enforced server-side and
//   cannot be bypassed by the client).
// - The OTP is hashed (bcrypt) before being stored — never stored in plain
//   text.
// - Actual SMS delivery is a placeholder (see lib/otp/sender.ts) — it just
//   logs the code to the server console for now.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpSchema } from "@/lib/validations/auth";
import { generateOtpCode, hashOtpCode } from "@/lib/otp/generate";
import { sendOtp } from "@/lib/otp/sender";

const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 2 * 60;

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const parsed = sendOtpSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const { phone } = parsed.data;

    // Find or create the user. First-ever OTP request for a phone number
    // implicitly registers them as a PARENT.
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
        user = await prisma.user.create({ data: { phone, role: "PARENT" } });
    }

    // Enforce resend cooldown server-side.
    if (user.otpLastSentAt) {
        const secondsSinceLastSend =
            (Date.now() - user.otpLastSentAt.getTime()) / 1000;

        if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
            const retryAfterSeconds = Math.ceil(
                RESEND_COOLDOWN_SECONDS - secondsSinceLastSend
            );
            return NextResponse.json(
                {
                    success: false,
                    error: `لطفا ${Math.ceil(retryAfterSeconds / 60)} دقیقه صبر کنید`,
                    retryAfterSeconds,
                },
                { status: 429 }
            );
        }
    }

    const code = generateOtpCode();
    const hashedCode = await hashOtpCode(code);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            otpCode: hashedCode,
            otpExpiresAt: expiresAt,
            otpLastSentAt: now,
        },
    });

    await sendOtp(phone, code);

    return NextResponse.json({
        success: true,
        message: "کد تایید ارسال شد",
    });
}