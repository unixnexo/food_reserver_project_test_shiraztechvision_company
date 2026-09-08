type OrderSuccessDetailsProps = {
    trackingCode: string | null;
    totalAmount: number;
};

export function OrderSuccessDetails({
    trackingCode,
    totalAmount,
}: OrderSuccessDetailsProps) {
    return (
        <div className="flex flex-col gap-3">
            {trackingCode && (
                <div className="rounded-2xl border border-border/70 bg-muted/30 px-5 py-4 text-center">
                    <p className="mb-1.5 text-xs text-muted-foreground">کد پیگیری</p>
                    <p className="font-mono text-xl font-bold tracking-wide" dir="ltr">
                        {trackingCode}
                    </p>
                </div>
            )}

            <div className="flex items-center justify-between rounded-2xl bg-[#183D2B] px-5 py-4 text-white">
                <span className="text-sm font-medium">مبلغ پرداخت شده</span>
                <span className="text-lg font-bold">
                    {totalAmount.toLocaleString("fa-IR")} تومان
                </span>
            </div>
        </div>
    );
}