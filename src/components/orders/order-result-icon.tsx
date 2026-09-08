import { CheckCircle2, XCircle } from "lucide-react";

type OrderResultIconProps = {
    isPaid: boolean;
};

export function OrderResultIcon({ isPaid }: OrderResultIconProps) {
    if (isPaid) {
        return (
            <div className="flex size-20 items-center justify-center rounded-full bg-[#EAF3ED]">
                <CheckCircle2 className="size-10 text-[#183D2B]" />
            </div>
        );
    }

    return (
        <div className="flex size-20 items-center justify-center rounded-full bg-red-50">
            <XCircle className="size-10 text-red-600" />
        </div>
    );
}