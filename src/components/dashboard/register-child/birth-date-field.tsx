import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PERSIAN_MONTH_NAMES, jalaliMonthLength, getBirthYearRange } from "@/lib/date/jalali";

type BirthDateFieldProps = {
    year: string;
    month: string;
    day: string;
    onYearChange: (value: string) => void;
    onMonthChange: (value: string) => void;
    onDayChange: (value: string) => void;
};

export function BirthDateField({
    year,
    month,
    day,
    onYearChange,
    onMonthChange,
    onDayChange,
}: BirthDateFieldProps) {
    const years = getBirthYearRange();
    const dayCount =
        year && month ? jalaliMonthLength(Number(year), Number(month)) : 31;
    const days = Array.from({ length: dayCount }, (_, i) => i + 1);

    return (
        <div className="flex flex-col gap-2">
            <Label className="text-sm">تاریخ تولد</Label>

            <div className="grid grid-cols-3 gap-2">
                <Select value={day || undefined} onValueChange={(v) => v && onDayChange(v)}>
                    <SelectTrigger className="h-12 w-full rounded-2xl border-border/70 px-3 text-base">
                        <SelectValue placeholder="روز">
                            {(v: string) => v || "روز"}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                        {days.map((d) => (
                            <SelectItem key={d} value={String(d)}>
                                {d}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={month || undefined} onValueChange={(v) => v && onMonthChange(v)}>
                    <SelectTrigger className="h-12 w-full rounded-2xl border-border/70 px-3 text-base">
                        <SelectValue placeholder="ماه">
                            {(v: string) => PERSIAN_MONTH_NAMES[Number(v) - 1] ?? "ماه"}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {PERSIAN_MONTH_NAMES.map((name, index) => (
                            <SelectItem key={name} value={String(index + 1)}>
                                {name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={year || undefined} onValueChange={(v) => v && onYearChange(v)}>
                    <SelectTrigger className="h-12 w-full rounded-2xl border-border/70 px-3 text-base">
                        <SelectValue placeholder="سال">
                            {(v: string) => v || "سال"}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                                {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}