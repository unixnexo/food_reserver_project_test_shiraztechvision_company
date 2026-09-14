"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { PhoneStep } from "@/components/login/phone-step";
import { OtpStep } from "@/components/login/otp-step";


const RESEND_COOLDOWN_SECONDS = 120;

type Phase = "phone" | "otp";

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.25,
            ease: "easeIn",
        },
    },
};

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
            if (cooldownIntervalRef.current) {
                clearInterval(cooldownIntervalRef.current);
            }
        };
    }, []);

    function startCooldown() {
        if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current);
        }

        setCooldown(RESEND_COOLDOWN_SECONDS);

        cooldownIntervalRef.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    if (cooldownIntervalRef.current) {
                        clearInterval(cooldownIntervalRef.current);
                    }

                    return 0;
                }

                return prev - 1;
            });
        }, 1000);
    }

    function normalizePhone(value: string) {
        return value.replace(/\D/g, "").slice(0, 11);
    }

    function isValidPhone(value: string) {
        return /^09\d{9}$/.test(value);
    }

    function formatPhone(value: string) {
        return value.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
    }

    function formatCooldown(seconds: number) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    }

    async function handleSendOtp() {
        if (!isValidPhone(phone)) return;

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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
        if (code.length !== 5) return;

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phone,
                    code,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                toast.error(data.error ?? "کدی که وارد کردی درست نیست");
                return;
            }

            toast.success("ورود موفقیت‌آمیز بود");

            router.push(
                data.role === "ADMIN" ? "/admin" : "/dashboard"
            );
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleChangePhone() {
        setCode("");
        setPhase("phone");
    }

    // return (
    //     <main className="min-h-screen">
    //         <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-6">
    //             {/* Back */}
    //             <BackButton />

    //             {/* Content */}
    //             <div className="flex flex-1 flex-col justify-center pb-16 pt-4">
    //                 <AnimatePresence mode="wait">
    //                     {phase === "phone" ? (
    //                         <PhoneStep
    //                             key="phone"
    //                             phone={phone}
    //                             isSubmitting={isSubmitting}
    //                             onPhoneChange={(value) =>
    //                                 setPhone(normalizePhone(value))
    //                             }
    //                             onSubmit={handleSendOtp}
    //                             variants={pageVariants}
    //                         />
    //                     ) : (
    //                         <OtpStep
    //                             key="otp"
    //                             phone={phone}
    //                             code={code}
    //                             isSubmitting={isSubmitting}
    //                             cooldown={cooldown}
    //                             onCodeChange={setCode}
    //                             onSubmit={handleVerifyOtp}
    //                             onResend={handleSendOtp}
    //                             onChangePhone={handleChangePhone}
    //                             formatPhone={formatPhone}
    //                             formatCooldown={formatCooldown}
    //                             variants={pageVariants}
    //                         />
    //                     )}
    //                 </AnimatePresence>
    //             </div>
    //         </div>
    //     </main>
    // );

    return (
        <main className="min-h-screen bg-[#F4F6F3]">
            <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
                <div className="flex flex-1 items-center justify-center py-8">
                    <div className="w-full overflow-hidden rounded-2xl border border-[#DCE3DE] bg-white shadow-[0_8px_30px_rgba(24,61,43,0.08)]">
                        {/* Green accent */}
                        <div className="h-1 bg-[#183D2B]" />

                        <div className="px-6 py-6 sm:px-8 sm:py-8">
                            {/* Header */}
                            <div className="relative mb-8 flex items-center justify-center">
                                <BackButton
                                    className="absolute right-0 top-0"
                                    onClick={() => router.push("/")}
                                />

                                <div className="flex size-20 items-center justify-center rounded-2xl border border-[#DCE3DE] bg-[#F8FAF8] p-3">
                                    <img
                                        src="/logo.png"
                                        alt="phfood"
                                        className="size-full object-contain"
                                    />
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {phase === "phone" ? (
                                    <PhoneStep
                                        key="phone"
                                        phone={phone}
                                        isSubmitting={isSubmitting}
                                        onPhoneChange={(value) =>
                                            setPhone(normalizePhone(value))
                                        }
                                        onSubmit={handleSendOtp}
                                        variants={pageVariants}
                                    />
                                ) : (
                                    <OtpStep
                                        key="otp"
                                        phone={phone}
                                        code={code}
                                        isSubmitting={isSubmitting}
                                        cooldown={cooldown}
                                        onCodeChange={setCode}
                                        onSubmit={handleVerifyOtp}
                                        onResend={handleSendOtp}
                                        onChangePhone={handleChangePhone}
                                        formatPhone={formatPhone}
                                        formatCooldown={formatCooldown}
                                        variants={pageVariants}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );

}