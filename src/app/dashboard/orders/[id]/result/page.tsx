// src/app/dashboard/orders/[id]/result/page.tsx
//
// PAGE PURPOSE (for AI agents / future readers):
// Landing page after returning from Zarinpal (see
// app/api/payment/callback/route.ts, which redirects here). Shows success
// (with tracking code) or failure, based on the `status` query param the
// callback route set. Always re-reads the order's ACTUAL status from the
// DB (not just trusting the query param) — the query param only picks
// which message to emphasize; the real status is the source of truth for
// what's displayed underneath.

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { OrderResultIcon } from "@/components/orders/order-result-icon";
import { OrderSuccessDetails } from "@/components/orders/order-success-details";

export default async function OrderResultPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order || order.userId !== session.userId) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-[#F7F5F0] p-4">
                <p className="text-sm text-muted-foreground">سفارش یافت نشد.</p>
            </div>
        );
    }

    const isPaid = order.status === "PAID";

    return (
        <div className="flex min-h-dvh items-center justify-center bg-[#F7F5F0] p-4">
            <div className="w-full max-w-sm rounded-3xl border border-border/70 bg-background p-6 shadow-sm sm:p-8">
                <div className="flex flex-col items-center text-center">
                    <OrderResultIcon isPaid={isPaid} />

                    <h1 className="mt-5 text-xl font-bold sm:text-2xl">
                        {isPaid ? "پرداخت موفق" : "پرداخت ناموفق"}
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {isPaid
                            ? "رزرو شما با موفقیت ثبت و پرداخت شد."
                            : "پرداخت انجام نشد یا لغو شد. می‌توانید دوباره تلاش کنید."}
                    </p>
                </div>

                {isPaid && (
                    <div className="mt-6">
                        <OrderSuccessDetails
                            trackingCode={order.trackingCode}
                            totalAmount={order.totalAmount}
                        />
                    </div>
                )}

                <Link href="/dashboard" className="mt-6 block">
                    <Button className="h-14 w-full rounded-full bg-[#183D2B] text-white hover:bg-[#24543C]">
                        بازگشت به پنل
                    </Button>
                </Link>
            </div>
        </div>
    );
}