// src/lib/sms/templates.ts
//
// Central place for every SMS message body used in the app. Keeping the
// wording here (instead of inline at each call site) makes it easy to
// review/update copy in one pass, and keeps call sites short.

export function otpMessage(code: string): string {
    return `کد ورود شما: ${code}`;
}

export function orderPlacedMessage(totalAmount: number): string {
    return `سفارش شما با موفقیت ثبت شد. مبلغ: ${totalAmount.toLocaleString("fa-IR")} تومان`;
}

export function orderCancelledMessage(params: {
    reason: string;
    refundedAmount: number;
    newBalance: number;
}): string {
    return `سفارش شما لغو شد. دلیل: ${params.reason}. مبلغ ${params.refundedAmount.toLocaleString("fa-IR")} تومان به کیف پول شما بازگشت داده شد. موجودی فعلی کیف پول: ${params.newBalance.toLocaleString("fa-IR")} تومان`;
}

export function walletAdjustedMessage(params: {
    type: "CREDIT" | "DEBIT";
    amount: number;
    newBalance: number;
}): string {
    const verb = params.type === "CREDIT" ? "افزایش" : "کاهش";
    return `موجودی کیف پول شما ${params.amount.toLocaleString("fa-IR")} تومان ${verb} یافت. موجودی فعلی: ${params.newBalance.toLocaleString("fa-IR")} تومان`;
}

export function orderEditedMessage(): string {
    return `سفارش شما با موفقیت ویرایش شد.`;
}