import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[9999] flex h-dvh w-full items-center justify-center bg-white/70">
            <Loader2 className="size-8 animate-spin text-[#183D2B]" />
        </div>
    );
}