// src/app/dashboard/page.tsx
//
// PAGE PURPOSE (for AI agents / future readers):
// Minimal placeholder parent dashboard. Shows:
// - The logged-in parent's registered children (via GET /api/children)
// - A link to register a new child
// - A logout button
//
// This is a landing point only — reservation flow (Step 6/7), payment
// history (Step 9), etc. will be added as their own sections/pages later.
// This page will be fleshed out or restructured once those steps land.
//
// This is a Server Component (no "use client") — it fetches children
// server-side on each request for simplicity at this stage.

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LogoutButton from "@/components/dashboard/logout-button";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const [user, children] = await Promise.all([
        prisma.user.findUnique({ where: { id: session.userId } }),
        prisma.child.findMany({
            where: { parentId: session.userId },
            include: { grade: true, school: true },
            orderBy: { createdAt: "asc" },
        }),
    ]);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold">پنل والدین</h1>
                    <p className="text-sm text-muted-foreground" dir="ltr">
                        {user?.phone}
                    </p>
                </div>
                <LogoutButton />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>فرزندان ثبت شده</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    {children.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            هنوز فرزندی ثبت نشده است.
                        </p>
                    )}
                    {children.map((child) => (
                        <div
                            key={child.id}
                            className="flex flex-col border rounded-md p-3 text-sm"
                        >
                            <span className="font-medium">
                                {child.firstName} {child.lastName}
                            </span>
                            <span className="text-muted-foreground">
                                {child.school.name} — {child.grade.name}
                            </span>
                        </div>
                    ))}
                    <Link href="/dashboard/register-child">
                        <Button variant="secondary" className="w-full">
                            ثبت فرزند جدید
                        </Button>
                    </Link>
                    {children.length > 0 && (
                        <Link href="/dashboard/reserve/daily">
                            <Button className="w-full">رزرو غذای روزانه</Button>
                        </Link>
                    )}
                    {children.length > 0 && (
                        <Link href="/dashboard/reserve/monthly">
                            <Button variant="secondary" className="w-full">
                                رزرو غذای ماهانه
                            </Button>
                        </Link>
                    )}
                    <Link href="/dashboard/history">
                        <Button variant="ghost" className="w-full">
                            تاریخچه رزروها
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}