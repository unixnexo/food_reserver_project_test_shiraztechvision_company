export function ReservationHistorySkeleton() {
    return (
        <div className="flex flex-col gap-4">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="overflow-hidden rounded-3xl border border-border/70 bg-background"
                >
                    <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
                        <div className="size-10 animate-pulse rounded-xl bg-muted" />

                        <div className="space-y-2">
                            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                        </div>
                    </div>

                    {[1, 2].map((row) => (
                        <div
                            key={row}
                            className="flex items-center justify-between px-5 py-4 sm:px-6"
                        >
                            <div className="space-y-2">
                                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                            </div>

                            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
