import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type StickyContinueBarProps = {
    label: string;
    onContinue: () => void;
    onBack?: () => void;
    disabled?: boolean;
    isLoading?: boolean;
};

export function StickyContinueBar({
    label,
    onContinue,
    onBack,
    disabled,
    isLoading,
}: StickyContinueBarProps) {
    return (
        <div className="sticky bottom-0 -mx-4 mt-6 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <div className="flex gap-3">
                {onBack && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="h-14 rounded-full border-border/70 px-6"
                    >
                        بازگشت
                    </Button>
                )}

                <Button
                    type="button"
                    onClick={onContinue}
                    disabled={disabled}
                    className="h-14 flex-1 rounded-full bg-[#183D2B] text-white hover:bg-[#24543C]"
                >
                    {isLoading && <Loader2 className="size-4 animate-spin" />}
                    {label}
                </Button>
            </div>
        </div>
    );
}