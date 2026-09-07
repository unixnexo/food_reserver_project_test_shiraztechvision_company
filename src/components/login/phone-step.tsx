"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type PhoneStepProps = {
    phone: string;
    isSubmitting: boolean;
    onPhoneChange: (value: string) => void;
    onSubmit: () => void;
    variants: any;
};

export function PhoneStep({
    phone,
    isSubmitting,
    onPhoneChange,
    onSubmit,
    variants,
}: PhoneStepProps) {
    const isValid = /^09\d{9}$/.test(phone);

    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col"
        >
            <div className="mb-12">
                <h1 className="text-4xl font-bold leading-[1.4] tracking-tight sm:text-5xl">
                    ورود به وعده
                </h1>

                <p className="mt-4 text-lg leading-8 text-muted-foreground">
                    با شماره موبایلت وارد شو
                </p>
            </div>

            <div className="flex flex-col">
                <label
                    htmlFor="phone"
                    className="mb-3 text-base font-medium text-muted-foreground"
                >
                    شماره موبایل
                </label>

                <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="0912 123 4567"
                    value={phone}
                    onChange={(e) => onPhoneChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && isValid) {
                            onSubmit();
                        }
                    }}
                    dir="ltr"
                    className="h-16 w-full border-0 border-b-2 border-border bg-transparent px-0 text-2xl font-medium tracking-wider outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary sm:text-3xl"
                />

                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    شماره موبایلت رو وارد کن تا کد تایید برات ارسال بشه.
                </p>
            </div>

            <Button
                type="button"
                onClick={onSubmit}
                disabled={!isValid || isSubmitting}
                className="mt-10 h-16 w-full rounded-full text-lg font-semibold"
            >
                {isSubmitting ? "در حال ارسال..." : "ادامه"}

                {!isSubmitting && (
                    <ArrowLeft className="mr-2 size-5" />
                )}
            </Button>
        </motion.div>
    );
}