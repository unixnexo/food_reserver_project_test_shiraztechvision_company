import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SubmitActionsProps = {
    isSubmitting: boolean;
    onSave: (e: React.FormEvent) => void;
    onSaveAndAddAnother: (e: React.FormEvent) => void;
};

export function SubmitActions({
    isSubmitting,
    onSave,
    onSaveAndAddAnother,
}: SubmitActionsProps) {
    return (
        <div className="flex flex-col gap-3 pt-2">
            <Button
                type="button"
                disabled={isSubmitting}
                onClick={onSave}
                className="h-14 rounded-full bg-[#183D2B] text-white hover:bg-[#24543C]"
            >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                ذخیره
            </Button>

            <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={onSaveAndAddAnother}
                className="h-14 rounded-full border-border/70"
            >
                ذخیره و افزودن فرزند دیگر
            </Button>
        </div>
    );
}