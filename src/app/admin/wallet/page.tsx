"use client";

import { useState } from "react";
import { Loader2, Search, Wallet, Plus, Minus, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pagination } from "@/components/shared/pagination";

type FoundUser = {
    id: string;
    phone: string;
    walletBalance: number;
    children: { id: string; firstName: string; lastName: string }[];
};

type WalletTransaction = {
    id: string;
    type: "CREDIT" | "DEBIT";
    reason: "ADMIN_ADJUSTMENT" | "ORDER_REFUND" | "WALLET_PAYMENT";
    amount: number;
    note: string | null;
    balanceAfter: number;
    createdAt: string;
    admin: { phone: string } | null;
};

const PAGE_SIZE = 20;

const REASON_LABELS: Record<WalletTransaction["reason"], string> = {
    ADMIN_ADJUSTMENT: "تغییر توسط مدیر",
    ORDER_REFUND: "بازگشت وجه سفارش",
    WALLET_PAYMENT: "پرداخت با کیف پول",
};

export default function AdminWalletPage() {
    const [phone, setPhone] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [user, setUser] = useState<FoundUser | null>(null);

    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"CREDIT" | "DEBIT">("CREDIT");
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [isLoadingTx, setIsLoadingTx] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    async function loadTransactions(userId: string, targetPage: number) {
        setIsLoadingTx(true);
        try {
            const params = new URLSearchParams();
            params.set("userId", userId);
            params.set("page", String(targetPage));
            params.set("pageSize", String(PAGE_SIZE));

            const res = await fetch(`/api/admin/wallet/transactions?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setTransactions(data.transactions);
                setPage(data.pagination.page);
                setTotalPages(data.pagination.totalPages);
                setTotalCount(data.pagination.totalCount);
            }
        } finally {
            setIsLoadingTx(false);
        }
    }

    async function handleSearch() {
        const trimmed = phone.trim();
        if (!trimmed) return;

        setIsSearching(true);
        setUser(null);

        try {
            const res = await fetch(
                `/api/admin/users/search?phone=${encodeURIComponent(trimmed)}`
            );
            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "کاربری یافت نشد");
                return;
            }

            setUser(data.user);
            await loadTransactions(data.user.id, 1);
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsSearching(false);
        }
    }

    async function handleSubmit() {
        if (!user) return;

        const amountNum = Number(amount);
        if (!amountNum || amountNum <= 0 || !Number.isInteger(amountNum)) {
            toast.error("مبلغ معتبر وارد کنید");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/admin/wallet/adjust", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    type,
                    amount: amountNum,
                    note: note.trim() || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || "بروزرسانی کیف پول انجام نشد");
                return;
            }

            toast.success(
                type === "CREDIT" ? "موجودی با موفقیت افزایش یافت" : "موجودی با موفقیت کاهش یافت"
            );

            setUser({ ...user, walletBalance: data.newBalance });
            setAmount("");
            setNote("");
            await loadTransactions(user.id, 1);
        } catch {
            toast.error("خطا در ارتباط با سرور");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="mx-auto w-full max-w-3xl">
            <div className="mb-8">
                <div className="mb-2 flex items-center gap-3">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3ED] text-[#183D2B]">
                        <Wallet className="size-6" />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        کیف پول کاربران
                    </h1>
                </div>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    با جستجوی شماره موبایل والد، می‌توانید موجودی کیف پول او را افزایش یا کاهش دهید.
                </p>
            </div>

            {/* Search */}
            <section className="mb-6 rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="شماره موبایل والد، مثلاً 09121234567"
                        dir="ltr"
                        className="h-12 rounded-2xl border-border/70 bg-muted/40 px-4 text-sm shadow-none"
                    />

                    <Button
                        type="button"
                        onClick={handleSearch}
                        disabled={isSearching || !phone.trim()}
                        className="h-12 shrink-0 rounded-2xl bg-[#183D2B] px-5 text-white hover:bg-[#24543C]"
                    >
                        {isSearching ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Search className="size-4" />
                        )}
                        جستجو
                    </Button>
                </div>
            </section>

            {user && (
                <>
                    {/* User summary */}
                    <section className="mb-6 rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]">
                                <UserIcon className="size-4" />
                            </div>
                            <div>
                                <p dir="ltr" className="text-sm font-medium">
                                    {user.phone}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {user.children.length > 0
                                        ? user.children
                                            .map((c) => `${c.firstName} ${c.lastName}`)
                                            .join("، ")
                                        : "بدون فرزند ثبت‌شده"}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-muted/40 px-4 py-3">
                            <p className="text-xs text-muted-foreground">موجودی فعلی</p>
                            <p className="mt-1 text-xl font-bold">
                                {user.walletBalance.toLocaleString("fa-IR")} تومان
                            </p>
                        </div>
                    </section>

                    {/* Adjust form */}
                    <section className="mb-6 rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                        <h2 className="mb-4 text-base font-semibold">تغییر موجودی</h2>

                        <div className="flex flex-col gap-4">
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={type === "CREDIT" ? "default" : "outline"}
                                    onClick={() => setType("CREDIT")}
                                    className={
                                        "h-11 flex-1 rounded-2xl " +
                                        (type === "CREDIT" ? "bg-[#183D2B] text-white hover:bg-[#24543C]" : "")
                                    }
                                >
                                    <Plus className="size-4" />
                                    افزایش موجودی
                                </Button>
                                <Button
                                    type="button"
                                    variant={type === "DEBIT" ? "default" : "outline"}
                                    onClick={() => setType("DEBIT")}
                                    className={
                                        "h-11 flex-1 rounded-2xl " +
                                        (type === "DEBIT" ? "bg-red-600 text-white hover:bg-red-700" : "")
                                    }
                                >
                                    <Minus className="size-4" />
                                    کاهش موجودی
                                </Button>
                            </div>

                            <Input
                                value={amount}
                                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                                placeholder="مبلغ به تومان"
                                inputMode="numeric"
                                dir="ltr"
                                className="h-12 rounded-2xl border-border/70 bg-muted/40 px-4 text-sm shadow-none"
                            />

                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="توضیحات (اختیاری)"
                                className="min-h-20 rounded-2xl border-border/70 bg-muted/40 px-4 py-3 text-sm shadow-none"
                            />

                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !amount}
                                className="h-12 rounded-2xl bg-[#183D2B] text-white hover:bg-[#24543C]"
                            >
                                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                                ثبت تغییر
                            </Button>
                        </div>
                    </section>

                    {/* Transaction history */}
                    <section className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm sm:p-6">
                        <h2 className="mb-4 text-base font-semibold">
                            تاریخچه تراکنش‌ها ({totalCount.toLocaleString("fa-IR")})
                        </h2>

                        {isLoadingTx ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="size-6 animate-spin text-[#183D2B]" />
                            </div>
                        ) : transactions.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                تراکنشی ثبت نشده است.
                            </p>
                        ) : (
                            <div className="divide-y divide-border/60">
                                {transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between gap-3 py-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium">
                                                {REASON_LABELS[tx.reason]}
                                                {tx.admin && (
                                                    <span className="text-xs font-normal text-muted-foreground">
                                                        {" "}
                                                        ({tx.admin.phone})
                                                    </span>
                                                )}
                                            </p>
                                            {tx.note && (
                                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                    {tx.note}
                                                </p>
                                            )}
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {new Date(tx.createdAt).toLocaleString("fa-IR")}
                                            </p>
                                        </div>

                                        <div className="shrink-0 text-left">
                                            <p
                                                className={
                                                    "text-sm font-semibold " +
                                                    (tx.type === "CREDIT" ? "text-green-700" : "text-red-600")
                                                }
                                            >
                                                {tx.type === "CREDIT" ? "+" : "-"}
                                                {tx.amount.toLocaleString("fa-IR")}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                موجودی: {tx.balanceAfter.toLocaleString("fa-IR")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            totalCount={totalCount}
                            pageSize={PAGE_SIZE}
                            isLoading={isLoadingTx}
                            onPageChange={(p) => loadTransactions(user.id, p)}
                        />
                    </section>
                </>
            )}
        </div>
    );
}