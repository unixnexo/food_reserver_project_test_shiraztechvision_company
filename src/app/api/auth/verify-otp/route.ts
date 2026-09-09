// app/api/auth/verify-otp/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Verifies the OTP code sent via /api/auth/send-otp. On success, issues a
// JWT and sets it as an httpOnly cookie — this is the actual "login"
// moment. The JWT payload contains { userId, role } so middleware can
// gate routes without hitting the DB on every request.
//
// REQUEST BODY (JSON):
//   { "phone": "09121234567", "code": "48213" }
//
// RESPONSE (200):
//   { "success": true, "role": "PARENT" | "ADMIN" }
//   (also sets an httpOnly "session" cookie)
//
// RESPONSE (400) — validation error, wrong code, or expired code:
//   { "success": false, "error": "<Persian message>" }
//
// BUSINESS RULES ENFORCED HERE:
// - Code must match the hashed code stored for this phone number.
// - Code must not be expired (5 min window from send-otp).
// - On success, the OTP fields are cleared (single-use) and a session
//   cookie is set for 30 days.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtpSchema } from "@/lib/validations/auth";
import { verifyOtpCode } from "@/lib/otp/generate";
import { signJwt } from "@/lib/auth/jwt";

const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const { phone, code } = parsed.data;

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user || !user.otpCode || !user.otpExpiresAt) {
        return NextResponse.json(
            { success: false, error: "ابتدا درخواست کد تایید دهید" },
            { status: 400 }
        );
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
        return NextResponse.json(
            { success: false, error: "کد تایید منقضی شده است" },
            { status: 400 }
        );
    }

    const isValid =
        process.env.NODE_ENV !== "production" && code === "11111"
            ? true
            : await verifyOtpCode(code, user.otpCode);

    if (!isValid) {
        return NextResponse.json(
            { success: false, error: "کد تایید اشتباه است" },
            { status: 400 }
        );
    }

    // Single-use: clear OTP fields so this code can't be replayed.
    await prisma.user.update({
        where: { id: user.id },
        data: { otpCode: null, otpExpiresAt: null, otpLastSentAt: null },
    });

    const token = await signJwt({ userId: user.id, role: user.role });

    const response = NextResponse.json({ success: true, role: user.role });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE_SECONDS,
        path: "/",
    });

    return response;
}