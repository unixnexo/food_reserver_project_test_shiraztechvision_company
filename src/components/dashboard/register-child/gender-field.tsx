import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type GenderFieldProps = {
    value: "MALE" | "FEMALE";
    onChange: (value: "MALE" | "FEMALE") => void;
};

const LABELS: Record<"MALE" | "FEMALE", string> = {
    MALE: "پسر",
    FEMALE: "دختر",
};

export function GenderField({ value, onChange }: GenderFieldProps) {
    return (
        <div className="flex flex-col gap-2">
            <Label className="text-sm">جنسیت</Label>
            <Select
                value={value}
                onValueChange={(v) => v && onChange(v as "MALE" | "FEMALE")}
            >
                <SelectTrigger className="h-12 w-full rounded-2xl border-border/70 px-4 text-base">
                    <SelectValue placeholder="انتخاب کنید">
                        {(v: string) => LABELS[v as "MALE" | "FEMALE"] ?? "انتخاب کنید"}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="MALE">پسر</SelectItem>
                    <SelectItem value="FEMALE">دختر</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}