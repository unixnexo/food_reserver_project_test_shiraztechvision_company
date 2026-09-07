export function formatPrice(value: string | number): string {
    const digits = String(value).replace(/\D/g, "");

    if (!digits) return "";

    return Number(digits).toLocaleString("en-US");
}