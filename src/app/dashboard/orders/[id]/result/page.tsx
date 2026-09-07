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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        return <p className="p-4 text-sm">سفارش یافت نشد.</p>;
    }

    const isPaid = order.status === "PAID";

    return (
        <div className="flex flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>{isPaid ? "پرداخت موفق" : "پرداخت ناموفق"}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    {isPaid ? (
                        <>
                            <p className="text-sm text-muted-foreground">
                                رزرو شما با موفقیت ثبت و پرداخت شد.
                            </p>
                            <div className="border rounded-md p-3 text-center">
                                <p className="text-xs text-muted-foreground mb-1">کد پیگیری</p>
                                <p className="font-mono font-bold text-lg" dir="ltr">
                                    {order.trackingCode}
                                </p>
                            </div>
                            <p className="text-sm">
                                مبلغ پرداخت شده: {order.totalAmount.toLocaleString()} تومن
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            پرداخت انجام نشد یا لغو شد. می‌توانید دوباره تلاش کنید.
                        </p>
                    )}
                    <Link href="/dashboard">
                        <Button className="w-full">بازگشت به پنل</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}