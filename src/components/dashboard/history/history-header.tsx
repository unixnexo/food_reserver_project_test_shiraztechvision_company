import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function HistoryHeader() {
    return (
        <header className="border-b border-border/70 bg-background">
            <div className="mx-auto flex h-20 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
                <Link
                    href="/dashboard"
                    aria-label="بازگشت به داشبورد"
                    className="flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                    <ChevronRight className="size-5" />
                </Link>

                <Image
                    src="/logo.png"
                    alt="وعده"
                    width={140}
                    height={50}
                    priority
                    className="h-auto w-[92px] object-contain sm:w-[110px]"
                />

                <div className="size-11" />
            </div>
        </header>
    );
}


