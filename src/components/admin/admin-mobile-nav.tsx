"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, ChevronLeft } from "lucide-react";
import { useState } from "react";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import LogoutButton from "@/components/dashboard/logout-button";

type NavItem = {
    href: string;
    label: string;
};

type AdminMobileNavProps = {
    items: NavItem[];
};

export function AdminMobileNav({ items }: AdminMobileNavProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            {/* <SheetTrigger asChild>
                <button
                    type="button"
                    aria-label="باز کردن منو"
                    className="flex size-11 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted active:scale-95 lg:hidden"
                >
                    <Menu className="size-5" />
                </button>
            </SheetTrigger> */}

            <SheetTrigger
                aria-label="باز کردن منو"
                className="flex size-11 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted active:scale-95 xl:hidden"
            >
                <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent
                side="right"
                className="w-[85%] max-w-sm border-l-0 p-0 sm:w-[380px]"
            >
                <div className="flex h-full min-h-0 flex-col">
                    <SheetHeader className="shrink-0 border-b border-border px-6 pb-6 pt-8 text-right">
                    </SheetHeader>

                    <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
                        {items.map((item, index) => {
                            const isActive =
                                item.href === "/admin"
                                    ? pathname === "/admin"
                                    : pathname.startsWith(item.href);

                            return (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, x: 24 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: index * 0.07,
                                        duration: 0.3,
                                        ease: "easeOut",
                                    }}
                                    className="mb-2"
                                >
                                    <Link
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={`flex h-14 items-center justify-between rounded-2xl px-4 text-base font-medium transition-colors ${isActive
                                                ? "bg-[#183D2B] text-white"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                    >
                                        <span>{item.label}</span>
                                        <ChevronLeft className="size-5" />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </nav>

                    <div className="shrink-0 border-t border-border p-4">
                        <LogoutButton variant="menu" />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}