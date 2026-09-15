"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

type NavItem = {
    href: string;
    label: string;
};

type AdminDesktopNavProps = {
    items: NavItem[];
};

export function AdminDesktopNav({ items }: AdminDesktopNavProps) {
    const pathname = usePathname();

    return (
        <nav className="hidden items-center gap-1 xl:flex">
            {items.map((item) => {
                const isActive =
                    item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="relative rounded-full px-4 py-2.5 text-sm font-medium transition-colors"
                    >
                        {isActive && (
                            <motion.span
                                layoutId="admin-active-nav"
                                className="absolute inset-0 -z-0 rounded-full bg-[#183D2B]"
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                }}
                            />
                        )}

                        <span
                            className={`relative z-10 ${isActive
                                    ? "text-white"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}