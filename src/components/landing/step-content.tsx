"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

type Step = {
    id: number;
    image: string;
    title: string;
    description: string;
};

type StepContentProps = {
    step: Step;
};

export function StepContent({ step }: StepContentProps) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{
                    duration: 0.35,
                    ease: "easeOut",
                }}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20"
            >
                {/* Image */}
                <div className="order-1 overflow-hidden rounded-[28px] sm:rounded-[36px] lg:order-1">
                    <Image
                        src={step.image}
                        alt={step.title}
                        width={1200}
                        height={900}
                        className="h-auto w-full object-cover"
                    />
                </div>

                {/* Text */}
                <div className="order-2 flex flex-col items-center text-center lg:items-start lg:text-right">
                    <span className="mb-5 flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                        {step.id}
                    </span>

                    <h3 className="text-3xl font-bold leading-[1.4] tracking-tight sm:text-4xl">
                        {step.title}
                    </h3>

                    <p className="mt-5 max-w-md text-base leading-8 text-muted-foreground sm:text-lg">
                        {step.description}
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}