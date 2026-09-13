// src/app/dashboard/orders/[id]/page.tsx
//
// PLACEHOLDER — shows basic confirmation that the order was created.
// Step 8 will replace/extend this to actually redirect into the Zarinpal
// payment flow immediately after order creation, and to show final
// PAID/FAILED status after returning from the gateway.

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: { items: { include: { menuItem: { include: { food: true } } } } },
    });

    if (!order || order.userId !== session.userId) {
        return <p className="p-4 text-sm">سفارش یافت نشد.</p>;
    }

    return (
        <div className="p-4 max-w-lg mx-auto flex flex-col gap-3">
            <h1 className="text-lg font-bold">سفارش ثبت شد</h1>
            <p className="text-sm text-muted-foreground">
                وضعیت:{" "}
                {order.status === "PENDING"
                    ? "در انتظار پرداخت"
                    : order.status === "PAID"
                        ? "پرداخت شده"
                        : "ناموفق"}
            </p>
            <div className="flex flex-col gap-2">
                {order.items.map((item) => (
                    <div key={item.id} className="border rounded-md p-2 text-sm">
                        {item.date.toISOString().split("T")[0]} —{" "}
                        {item.menuItem.food.name} (
                        {item.portionType === "HALF" ? "نیم پرس" : "تمام پرس"}) —{" "}
                        {item.unitPrice.toLocaleString()} تومن
                    </div>
                ))}
            </div>
            <p className="font-bold">
                مجموع: {order.totalAmount.toLocaleString()} تومن
            </p>
            {order.status === "PENDING" && order.paymentMethod === "GATEWAY" && (
                <p className="text-sm text-muted-foreground">
                    اتصال به درگاه پرداخت زرین‌پال در مرحله بعد اضافه می‌شود.
                </p>
            )}
        </div>
    );
}