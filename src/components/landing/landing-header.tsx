import Image from "next/image";
import Link from "next/link";

export function LandingHeader() {
    return (
        <header className="w-full">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-center px-5 sm:h-24">
                <Link href="/" aria-label="صفحه اصلی">
                    <Image
                        src="/logo.png"
                        alt="لوگو"
                        width={140}
                        height={50}
                        priority
                        className="h-auto w-[110px] object-contain sm:w-[130px]"
                    />
                </Link>
            </div>
        </header>
    );
}