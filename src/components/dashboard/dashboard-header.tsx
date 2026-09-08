import Image from "next/image";
import LogoutButton from "@/components/dashboard/logout-button";

type DashboardHeaderProps = {
    phone: string;
};

export function DashboardHeader({ phone }: DashboardHeaderProps) {
    return (
        <header className="border-b border-border/70 bg-background">
            <div className="mx-auto flex h-20 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
                <Image
                    src="/logo.png"
                    alt="وعده"
                    width={140}
                    height={50}
                    priority
                    className="h-auto w-[92px] object-contain sm:w-[110px]"
                />

                <div className="flex items-center gap-3">
                    <p
                        className="text-sm text-muted-foreground"
                        dir="ltr"
                    >
                        {phone}
                    </p>

                    <div className="hidden sm:block">
                        <LogoutButton variant="desktop" />
                    </div>

                    <div className="sm:hidden">
                        <LogoutButton variant="mobile" />
                    </div>
                </div>
            </div>
        </header>
    );
}