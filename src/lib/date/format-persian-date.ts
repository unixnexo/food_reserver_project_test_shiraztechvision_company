export function formatPersianDate(date: Date): string {
    return new Intl.DateTimeFormat(
        "fa-IR-u-ca-persian",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    ).format(date);
}

export function formatPersianDateString(dateString: string): string {
    const date = new Date(`${dateString.split("T")[0]}T00:00:00`);

    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}