// import Image from "next/image";
// import Link from "next/link";

// export function LandingHeader() {
//     return (
//         <header className="w-full">
//             <div className="mx-auto flex h-20 max-w-7xl items-center justify-center px-5 sm:h-24">
//                 <Link href="/" aria-label="صفحه اصلی">
//                     <Image
//                         src="/logo.png"
//                         alt="لوگو"
//                         width={140}
//                         height={50}
//                         priority
//                         className="h-auto w-[50px] sm:w-[65px] object-contain"
//                     />
//                 </Link>
//             </div>
//         </header>
//     );
// }





import Image from "next/image";
import Link from "next/link";

export function LandingHeader() {
    return (
        <header className="w-full">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:h-24">
                {/* Brand */}
                <Link
                    href="/"
                    aria-label="صفحه اصلی"
                    className="flex items-center gap-3"
                >
                    <Image
                        src="/logo.png"
                        alt="لوگو"
                        width={140}
                        height={50}
                        priority
                        className="h-auto w-[50px] object-contain sm:w-[58px]"
                    />

                    {/* <span className="font-black tracking-[-0.04em] text-[#183D2B]">
                        <span className="text-2xl sm:text-3xl">PH</span>
                        <span className="text-lg sm:text-xl">food</span>
                    </span> */}
                </Link>

                {/* Navigation */}
                <Link
                    href="/contact"
                    className="text-sm font-medium text-[#183D2B] transition-colors hover:text-[#24543C]"
                >
                    تماس با ما
                </Link>
            </div>
        </header>
    );
}
