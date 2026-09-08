import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NationalCodeFieldProps = {
    value: string;
    onChange: (value: string) => void;
};

export function NationalCodeField({ value, onChange }: NationalCodeFieldProps) {
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor="nationalCode" className="text-sm">
                کد ملی
            </Label>
            <Input
                id="nationalCode"
                dir="ltr"
                inputMode="numeric"
                maxLength={10}
                value={value}
                onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
                className="h-12 rounded-2xl border-border/70 px-4 text-base"
            />
        </div>
    );
}