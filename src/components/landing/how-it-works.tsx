"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { StepContent } from "./step-content";

const steps = [
    {
        id: 1,
        image: "/step1.png",
        title: "روز موردنظرت را انتخاب کن",
        description:
            "از تقویم، روزی را که می‌خواهی غذای فرزندت در مدرسه آماده باشد انتخاب کن و رزرو را شروع کن.",
    },
    {
        id: 2,
        image: "/step2.png",
        title: "غذای فرزندت را انتخاب کن",
        description:
            "غذاهای موجود برای همان روز را ببین و از بین گزینه‌های خوشمزه، غذای موردنظرت را انتخاب کن.",
    },
    {
        id: 3,
        image: "/step3.png",
        title: "آنلاین پرداخت کن",
        description:
            "پس از انتخاب غذا، هزینه را به‌صورت آنلاین پرداخت کن تا سفارش فرزندت ثبت و نهایی شود.",
    },
    {
        id: 4,
        image: "/step4.png",
        title: "غذا سر وقت به مدرسه می‌رسد",
        description:
            "در روز انتخاب‌شده، غذای فرزندت آماده می‌شود و به مدرسه تحویل داده می‌شود؛ بدون دغدغه و پیگیری اضافه.",
    },
];

export function HowItWorks() {
    const [activeStep, setActiveStep] = useState(1);

    const currentStep = steps[activeStep - 1];

    return (
        <section className="px-5 pb-24 pt-10 sm:pb-32 sm:pt-16">
            <div className="mx-auto max-w-7xl">
                {/* Heading */}
                <div className="flex flex-col items-center text-center">
                    <span className="text-sm font-medium text-primary">
                        ساده و بی‌دغدغه
                    </span>

                    <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        چطور کار می‌کند؟
                    </h2>

                    <p className="mt-4 max-w-md text-base leading-8 text-muted-foreground">
                        در چهار قدم ساده، غذای فرزندت را برای روز مدرسه رزرو کن.
                    </p>
                </div>

                {/* Step buttons */}
                <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3">
                    {steps.map((step) => {
                        const isActive = activeStep === step.id;

                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => setActiveStep(step.id)}
                                className={`relative h-12 rounded-full px-5 text-sm font-medium transition-colors sm:px-6 ${isActive
                                        ? "text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {isActive && (
                                    <motion.span
                                        layoutId="active-step"
                                        className="absolute inset-0 -z-0 rounded-full bg-primary"
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30,
                                        }}
                                    />
                                )}

                                <span className="relative z-10">
                                    {step.id}.{" "}
                                    {step.id === 1
                                        ? "انتخاب روز"
                                        : step.id === 2
                                            ? "انتخاب غذا"
                                            : step.id === 3
                                                ? "پرداخت"
                                                : "تحویل غذا"}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Active step */}
                <div className="mt-12 sm:mt-16">
                    <StepContent step={currentStep} />
                </div>
            </div>
        </section>
    );
}