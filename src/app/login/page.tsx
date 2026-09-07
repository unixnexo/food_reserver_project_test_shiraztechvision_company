// app/login/route: /login
//
// PAGE PURPOSE (for AI agents / future readers):
// Single login page handling BOTH login and implicit registration — a
// phone number becomes a user automatically on first OTP request (see
// app/api/auth/send-otp/route.ts). This page has two phases, tracked by
// local component state (no routing change between them):
//
//   Phase 1 ("phone"): user enters their phone number, hits "ارسال کد"
//     → POST /api/auth/send-otp { phone }
//
//   Phase 2 ("otp"): user enters the 5-digit code they received
//     → POST /api/auth/verify-otp { phone, code }
//     → on success, a session cookie is set by the API route, and this
//       page redirects to "/dashboard" (middleware will redirect ADMIN
//       users to "/admin" automatically on their next navigation, but we
//       route directly based on the API response here for a snappy UX)
//
// A resend cooldown (2 minutes) is enforced by the server; this page just
// displays a countdown for UX and disables the resend button meanwhile.
// The actual expiry/cooldown rules live server-side and cannot be bypassed
// by manipulating this page's state.
//
// This is intentionally bare-bones styling — full UI/UX pass happens later
// by another design pass. Structure and data flow are the priority here.

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const RESEND_COOLDOWN_SECONDS = 120;

type Phase = "phone" | "otp";

export default function LoginPage() {
    const router = useRouter();
    const [phase, setPhase] = useState<Phase>("phone");
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
        };
    }, []);

    function startCooldown() {
        setCooldown(RESEND_COOLDOWN_SECONDS);
        cooldownIntervalRef.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }

    async function handleSendOtp() {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();

            if (!data.success) {
                toast.error(data.error ?? "خطایی رخ داد");
                return;
            }

            toast.success("کد تایید ارسال شد");
            setPhase("otp");
            startCooldown();
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleVerifyOtp() {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, code }),
            });
            const data = await res.json();

            if (!data.success) {
                toast.error(data.error ?? "خطایی رخ داد");
                return;
            }

            toast.success("ورود موفقیت‌آمیز بود");
            router.push(data.role === "ADMIN" ? "/admin" : "/dashboard");
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>ورود به سامانه</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {phase === "phone" && (
                        <>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="phone">شماره موبایل</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="09121234567"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    dir="ltr"
                                />
                            </div>
                            <Button onClick={handleSendOtp} disabled={isSubmitting || !phone}>
                                ارسال کد تایید
                            </Button>
                        </>
                    )}

                    {phase === "otp" && (
                        <>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="code">کد تایید</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="12345"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    dir="ltr"
                                    maxLength={5}
                                />
                            </div>
                            <Button onClick={handleVerifyOtp} disabled={isSubmitting || code.length !== 5}>
                                تایید و ورود
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleSendOtp}
                                disabled={isSubmitting || cooldown > 0}
                            >
                                {cooldown > 0
                                    ? `ارسال مجدد کد (${cooldown} ثانیه)`
                                    : "ارسال مجدد کد"}
                            </Button>
                            <button
                                type="button"
                                className="text-sm text-muted-foreground underline"
                                onClick={() => setPhase("phone")}
                            >
                                ویرایش شماره موبایل
                            </button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}