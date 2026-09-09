export function formatPersianDate(date: Date): string {
    const parts = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).formatToParts(date);

    const get = (type: string) =>
        parts.find((p) => p.type === type)?.value ?? "";

    return `${get("weekday")} ${get("day")} ${get("month")} ${get("year")}`;
}

export function formatPersianDateString(dateString: string): string {
    const date = new Date(`${dateString.split("T")[0]}T00:00:00`);

    const parts = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).formatToParts(date);

    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

    return `${get("weekday")} ${get("day")} ${get("month")} ${get("year")}`;
}