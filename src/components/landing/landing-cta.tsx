"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export function LandingCta() {
    return (
        <section className="px-5 pb-10 sm:pb-16">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[#183D2B] px-6 py-14 text-center sm:rounded-[40px] sm:px-12 sm:py-20 lg:px-20"
            >
                <div className="mx-auto max-w-2xl">
                    <h2 className="text-3xl font-bold leading-[1.4] tracking-tight text-white sm:text-4xl lg:text-5xl">
                        دیگه لازم نیست
                        <br />
                        نگران غذای فردا باشی.
                    </h2>

                    <p className="mx-auto mt-5 max-w-md text-base leading-8 text-white/70 sm:text-lg">
                        همه‌چیز آماده‌ست؛ فقط کافیه وارد حساب کاربریت بشی و
                        اولین وعده رو رزرو کنی.
                    </p>

                    <Link
                        href="/login"
                        className="mt-8 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-white px-8 text-base font-semibold text-[#183D2B] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        بریم شروع کنیم
                        <ArrowLeft className="size-5" />
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}