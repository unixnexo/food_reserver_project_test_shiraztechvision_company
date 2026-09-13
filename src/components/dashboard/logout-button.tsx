"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type LogoutButtonProps = {
    variant?: "desktop" | "mobile" | "menu";
    className?: string;
};

export default function LogoutButton({
    variant = "desktop",
    className = "",
}: LogoutButtonProps) {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    async function handleLogout() {
        setIsLoggingOut(true);

        try {
            // Keep your existing logout endpoint here.
            const res = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (!res.ok) {
                throw new Error("Logout failed");
            }

            toast.success("با موفقیت خارج شدی");
            router.push("/login");
            router.refresh();
        } catch {
            toast.error("خطا در خروج از حساب");
        } finally {
            setIsLoggingOut(false);
        }
    }

    const isMobile = variant === "mobile";
    const isMenu = variant === "menu";

    return (
        <AlertDialog>
            {/* <AlertDialogTrigger asChild>
                <button
                    type="button"
                    disabled={isLoggingOut}
                    className={`group inline-flex items-center justify-center gap-2 rounded-full transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${isMobile
                            ? "size-11 border border-border bg-background"
                            : isMenu
                                ? "h-12 w-full justify-start rounded-2xl px-4 text-base text-muted-foreground hover:bg-red-50 hover:text-red-600"
                                : "h-11 border border-border px-4 text-sm text-muted-foreground hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        } ${className}`}
                >
                    {isLoggingOut ? (
                        <Loader2 className="size-5 animate-spin" />
                    ) : (
                        <LogOut className="size-5 rotate-180" />
                    )}

                    {!isMobile && (
                        <span>خروج از حساب</span>
                    )}
                </button>
            </AlertDialogTrigger> */}

            <AlertDialogTrigger
                type="button"
                disabled={isLoggingOut}
                className={`group inline-flex items-center justify-center gap-2 rounded-full transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${isMobile
                    ? "size-11 border border-border bg-background"
                    : isMenu
                        ? "h-12 w-full justify-start rounded-2xl px-4 text-base text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        : "h-11 border border-border px-4 text-sm text-muted-foreground hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    } ${className}`}
            >
                {isLoggingOut ? (
                    <Loader2 className="size-5 animate-spin" />
                ) : (
                    <LogOut className="size-5 rotate-180" />
                )}

                {!isMobile && <span>خروج از حساب</span>}
            </AlertDialogTrigger>

            <AlertDialogContent className="rounded-[28px] sm:rounded-[32px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl">
                        می‌خواهی خارج شوی؟
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-base leading-7">
                        برای ورود دوباره باید شماره موبایلت را تایید کنی.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-2 sm:gap-2">
                    <AlertDialogCancel className="h-12 rounded-full">
                        انصراف
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={handleLogout}
                        className="h-12 rounded-full bg-red-600 text-white hover:bg-red-700"
                    >
                        خروج از حساب
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}