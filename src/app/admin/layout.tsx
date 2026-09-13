// import Image from "next/image";
// import Link from "next/link";

// import LogoutButton from "@/components/dashboard/logout-button";
// import { AdminDesktopNav } from "@/components/admin/admin-desktop-nav";
// import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

// const NAV_ITEMS = [
//     { href: "/admin", label: "گزارش‌ها" },
//     { href: "/admin/foods", label: "بانک غذا" },
//     { href: "/admin/menu", label: "تعریف منو" },
//     { href: "/admin/closed-days", label: "روزهای تعطیل" },
//     { href: "/admin/pricing", label: "قیمت‌گذاری" },
// ];

// export default function AdminLayout({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     return (
//         <div className="min-h-dvh bg-background">
//             {/* Header */}
//             <header className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
//                 <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between rounded-[28px] border border-border/60 bg-background px-4 shadow-sm sm:h-[84px] sm:px-6 lg:px-8">
//                     {/* Mobile menu */}
//                     <div className="lg:hidden block">
//                         <AdminMobileNav items={NAV_ITEMS} />
//                     </div>

//                     {/* Logo */}
//                     <Link
//                         href="/admin"
//                         className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
//                     >
//                         <Image
//                             src="/logo.png"
//                             alt="وعده"
//                             width={140}
//                             height={50}
//                             priority
//                             className="h-auto w-[100px] object-contain sm:w-[115px]"
//                         />
//                     </Link>

//                     {/* Desktop navigation */}
//                     <AdminDesktopNav items={NAV_ITEMS} />

//                     {/* Desktop logout / mobile logout */}
//                     <div className="flex items-center">
//                         <div className="hidden lg:block">
//                             <LogoutButton variant="desktop" />
//                         </div>

//                         <div className="lg:hidden">
//                             <LogoutButton variant="mobile" />
//                         </div>
//                     </div>
//                 </div>
//             </header>

//             {/* Page content */}
//             <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
//                 {children}
//             </main>
//         </div>
//     );
// }












import Image from "next/image";
import Link from "next/link";

import LogoutButton from "@/components/dashboard/logout-button";
import { AdminDesktopNav } from "@/components/admin/admin-desktop-nav";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

const NAV_ITEMS = [
    { href: "/admin", label: "گزارش‌ها" },
    { href: "/admin/foods", label: "بانک غذا" },
    { href: "/admin/schools", label: "مدرسه‌ها" },
    { href: "/admin/menu", label: "تعریف منو" },
    { href: "/admin/closed-days", label: "روزهای تعطیل" },
    { href: "/admin/pricing", label: "قیمت‌گذاری" },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-dvh bg-background">
            {/* Header */}
            <header className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
                <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between rounded-[28px] border border-border/60 bg-background px-4 shadow-sm sm:h-[84px] sm:px-6 lg:px-8">
                    {/* Mobile menu */}
                    <div className="lg:hidden block">
                        <AdminMobileNav items={NAV_ITEMS} />
                    </div>

                    {/* Logo */}
                    <Link
                        href="/admin"
                        className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
                    >
                        <Image
                            src="/logo.png"
                            alt="وعده"
                            width={140}
                            height={50}
                            priority
                            className="h-auto w-[100px] object-contain sm:w-[115px]"
                        />
                    </Link>

                    {/* Desktop navigation */}
                    <AdminDesktopNav items={NAV_ITEMS} />

                    {/* Desktop logout / mobile logout */}
                    <div className="flex items-center">
                        <div className="hidden lg:block">
                            <LogoutButton variant="desktop" />
                        </div>

                        <div className="lg:hidden">
                            <LogoutButton variant="mobile" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Page content */}
            <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-12">
                {children}
            </main>
        </div>
    );
}
