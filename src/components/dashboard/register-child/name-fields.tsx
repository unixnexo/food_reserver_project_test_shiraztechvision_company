import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NameFieldsProps = {
    firstName: string;
    lastName: string;
    onFirstNameChange: (value: string) => void;
    onLastNameChange: (value: string) => void;
};

export function NameFields({
    firstName,
    lastName,
    onFirstNameChange,
    onLastNameChange,
}: NameFieldsProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
                <Label htmlFor="firstName" className="text-sm">
                    نام
                </Label>
                <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => onFirstNameChange(e.target.value)}
                    className="h-12 rounded-2xl border-border/70 px-4 text-base"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="lastName" className="text-sm">
                    نام خانوادگی
                </Label>
                <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => onLastNameChange(e.target.value)}
                    className="h-12 rounded-2xl border-border/70 px-4 text-base"
                />
            </div>
        </div>
    );
}