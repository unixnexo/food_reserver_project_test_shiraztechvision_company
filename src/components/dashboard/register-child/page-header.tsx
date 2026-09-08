import { BackButton } from "@/components/shared/back-button";

export function PageHeader() {
    return (
        <div className="mb-8 flex items-center gap-4">
            <BackButton />

            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                ثبت اطلاعات فرزند
            </h1>
        </div>
    );
}