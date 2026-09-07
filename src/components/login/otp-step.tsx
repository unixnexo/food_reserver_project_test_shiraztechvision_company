"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type OtpStepProps = {
    phone: string;
    code: string;
    isSubmitting: boolean;
    cooldown: number;
    onCodeChange: (value: string) => void;
    onSubmit: () => void;
    onResend: () => void;
    onChangePhone: () => void;
    formatPhone: (value: string) => string;
    formatCooldown: (seconds: number) => string;
    variants: any;
};

export function OtpStep({
    phone,
    code,
    isSubmitting,
    cooldown,
    onCodeChange,
    onSubmit,
    onResend,
    onChangePhone,
    formatPhone,
    formatCooldown,
    variants,
}: OtpStepProps) {
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    function handleInput(index: number, value: string) {
        const digit = value.replace(/\D/g, "").slice(-1);

        const nextCode = code.split("");
        nextCode[index] = digit;

        onCodeChange(nextCode.join("").slice(0, 5));

        if (digit && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    function handleKeyDown(
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (e.key === "ArrowRight" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (e.key === "ArrowLeft" && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
        e.preventDefault();

        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 5);

        if (!pasted) return;

        onCodeChange(pasted);

        const nextIndex = Math.min(pasted.length, 4);
        inputRefs.current[nextIndex]?.focus();
    }

    const isComplete = code.length === 5;

    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col"
        >
            <div className="mb-12">
                <h1 className="text-4xl font-bold leading-[1.4] tracking-tight">
                    کد تایید را وارد کن
                </h1>

                <p className="mt-4 text-lg leading-8 text-muted-foreground">
                    کد ارسال‌شده به{" "}
                    <span className="font-medium text-foreground" dir="ltr">
                        {formatPhone(phone)}
                    </span>{" "}
                    را وارد کن.
                </p>
            </div>

            {/* OTP inputs */}
            <div className="flex justify-center gap-3 sm:gap-4" dir="ltr">
                {Array.from({ length: 5 }).map((_, index) => {
                    const isFilled = Boolean(code[index]);

                    return (
                        <motion.input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={1}
                            value={code[index] ?? ""}
                            onChange={(e) =>
                                handleInput(index, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: isFilled ? 1.04 : 1,
                            }}
                            transition={{
                                delay: index * 0.06,
                                duration: 0.3,
                                ease: "easeOut",
                            }}
                            className="size-14 rounded-2xl border-2 border-border bg-transparent text-center text-2xl font-semibold outline-none transition-colors focus:border-primary"
                        />
                    );
                })}
            </div>

            <Button
                type="button"
                onClick={onSubmit}
                disabled={!isComplete || isSubmitting}
                className="mt-10 h-16 w-full rounded-full text-lg font-semibold"
            >
                {isSubmitting ? "در حال بررسی..." : "تایید و ورود"}

                {!isSubmitting && (
                    <ArrowLeft className="mr-2 size-5" />
                )}
            </Button>

            <div className="mt-8 flex flex-col items-center gap-5 text-base">
                <button
                    type="button"
                    onClick={onResend}
                    disabled={cooldown > 0 || isSubmitting}
                    className="text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {cooldown > 0
                        ? `ارسال مجدد کد (${formatCooldown(cooldown)})`
                        : "ارسال مجدد کد"}
                </button>

                <button
                    type="button"
                    onClick={onChangePhone}
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                >
                    ویرایش شماره موبایل
                </button>
            </div>
        </motion.div>
    );
}