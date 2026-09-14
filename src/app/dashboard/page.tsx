import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getChildrenUpcomingStatus } from "@/lib/reservation/upcoming-status";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ChildCard } from "@/components/dashboard/child-card";
import { EmptyChildrenState } from "@/components/dashboard/empty-children-state";
import { DashboardActions } from "@/components/dashboard/dashboard-actions";

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

    const statusMap = await getChildrenUpcomingStatus(
        children.map((c) => c.id)
    );

    return (
        <div className="min-h-dvh bg-[#F7F5F0]">
            <DashboardHeader phone={user?.phone ?? ""} />

            <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
                <div className="mb-8 overflow-hidden rounded-2xl border border-[#DCE3DE] bg-white shadow-sm">
    <div className="h-1 bg-[#183D2B]" />

    <div className="px-5 py-5 sm:px-6">
        <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B] text-lg">
                👋
            </div>

            <div>
                <h1 className="text-xl font-bold tracking-tight text-[#183D2B] sm:text-2xl">
                    سلام
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    فرزندانت را مدیریت کن و غذای روزانه یا ماهانه رزرو کن.
                </p>
            </div>
        </div>
    </div>
</div>

                {children.length === 0 ? (
                    <EmptyChildrenState />
                ) : (
                    <div className="flex flex-col gap-4">
                        {children.map((child) => {
                            const status = statusMap.get(child.id);

                            return (
                                <ChildCard
                                    key={child.id}
                                    id={child.id}
                                    firstName={child.firstName}
                                    lastName={child.lastName}
                                    schoolName={child.school.name}
                                    gradeName={child.grade.name}
                                    days={status?.days ?? []}
                                    needsAction={status?.needsAction ?? false}
                                />
                            );
                        })}
                    </div>
                )}

                <div className="mt-8">
                    <DashboardActions />
                </div>
            </main>
        </div>
    );
}