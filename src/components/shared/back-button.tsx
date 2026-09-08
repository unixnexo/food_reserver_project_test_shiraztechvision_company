"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

type BackButtonProps = {
    className?: string;
    onClick?: () => void;
};

export function BackButton({ className = "", onClick }: BackButtonProps) {
    const router = useRouter();

    return (
        <button
            type="button"
            onClick={onClick ?? (() => router.back())}
            aria-label="بازگشت"
            className={`flex size-12 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted active:scale-95 ${className}`}
        >
            <ArrowRight className="size-5" />
        </button>
    );
}