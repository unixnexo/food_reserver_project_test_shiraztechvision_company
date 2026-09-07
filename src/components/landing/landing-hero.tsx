"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 24,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

export function LandingHero() {
    return (
        <section className="px-5 pb-20 pt-8 sm:pb-28 sm:pt-14">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-20"
            >
                {/* Image */}
                <motion.div
                    variants={itemVariants}
                    className="relative order-1 overflow-hidden rounded-[28px] sm:rounded-[36px] lg:order-1"
                >
                    <Image
                        src="/hero.png"
                        alt="غذای فرزندت، سر وقت و بی‌دغدغه"
                        width={1200}
                        height={900}
                        priority
                        className="h-auto w-full object-cover"
                    />
                </motion.div>

                {/* Content */}
                <motion.div
                    variants={itemVariants}
                    className="order-2 flex flex-col items-center text-center lg:items-start lg:text-right"
                >
                    <h1 className="max-w-xl text-4xl font-bold leading-[1.35] tracking-tight sm:text-5xl lg:text-6xl">
                        وعده؛ غذای فرزندت،
                        <br />
                        سر وقت و بی‌دغدغه.
                    </h1>

                    <p className="mt-5 max-w-md text-base leading-8 text-muted-foreground sm:text-lg">
                        غذای فرزندت را از قبل انتخاب کن،
                        <br className="hidden sm:block" />
                        تا روز مدرسه با خیال راحت منتظرش باشی.
                    </p>

                    <Link
                        href="/login"
                        className="mt-8 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-primary px-7 text-base font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        شروع کنیم
                        <ArrowLeft className="size-5" />
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    );
}