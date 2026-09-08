type Step = {
    key: string;
    label: string;
};

type ReservationProgressProps = {
    steps: Step[];
    currentIndex: number;
};

export function ReservationProgress({ steps, currentIndex }: ReservationProgressProps) {
    return (
        <div className="mb-6 flex items-center gap-2">
            {steps.map((step, index) => {
                const isDone = index < currentIndex;
                const isActive = index === currentIndex;

                return (
                    <div key={step.key} className="flex flex-1 items-center gap-2">
                        <div className="flex flex-1 flex-col gap-1.5">
                            <div
                                className={`h-1.5 rounded-full transition-colors ${isDone || isActive ? "bg-[#183D2B]" : "bg-muted"
                                    }`}
                            />
                            <span
                                className={`hidden text-xs font-medium sm:block ${isActive
                                        ? "text-[#183D2B]"
                                        : isDone
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}