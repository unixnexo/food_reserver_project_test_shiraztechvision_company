// src/app/api/admin/reports/route.ts
//
// PAGE/ROUTE PURPOSE (for AI agents / future readers):
// Full system-wide reservation/order report for admin, filterable by
// school, grade, a specific reservation day, a specific Jalali month, order
// status, and order type. ADMIN-only. Unpaginated by design (MVP scope) —
// results are always implicitly bounded by whichever date filter is
// applied; if NO date filter is given, ALL records are returned (fine for
// MVP data volumes, revisit with real pagination if this becomes slow).
//
// GET QUERY PARAMS (all optional, combine as AND filters):
//   ?schoolId=...
//   &gradeId=...
//   &date=YYYY-MM-DD          (exact reservation day)
//   &jalaliYear=1405&jalaliMonth=7   (whole Jalali month of reservation days)
//   &orderStatus=PENDING|PAID|FAILED
//   &orderType=DAILY|MONTHLY
//
// GET RESPONSE (200):
//   {
//     "success": true,
//     "rows": [
//       {
//         "date": "YYYY-MM-DD",            // reservation day (food is FOR this day)
//         "childName": string,
//         "schoolName": string,
//         "gradeName": string,
//         "foodName": string,
//         "portionType": "HALF" | "FULL",
//         "amount": number,                 // تومن
//         "orderId": string,
//         "orderType": "DAILY" | "MONTHLY",
//         "orderStatus": "PENDING" | "PAID" | "FAILED",
//         "parentPhone": string,
//         "orderPlacedAt": string           // ISO datetime — exact date+time order was placed
//       },
//       ...
//     ]
//   }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminReportFilterSchema } from "@/lib/validations/admin-report";
import { jalaliToGregorian, jalaliMonthLength } from "@/lib/date/jalali";
import { toDateOnly } from "@/lib/date/normalize";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const { searchParams } = new URL(request.url);
    const parsed = adminReportFilterSchema.safeParse({
        schoolId: searchParams.get("schoolId") ?? undefined,
        gradeId: searchParams.get("gradeId") ?? undefined,
        date: searchParams.get("date") ?? undefined,
        jalaliYear: searchParams.get("jalaliYear") ?? undefined,
        jalaliMonth: searchParams.get("jalaliMonth") ?? undefined,
        orderStatus: searchParams.get("orderStatus") ?? undefined,
        orderType: searchParams.get("orderType") ?? undefined,
        includeCancelled: searchParams.get("includeCancelled") ?? undefined,
        page: searchParams.get("page") ?? undefined,
        pageSize: searchParams.get("pageSize") ?? undefined,
    });

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, error: parsed.error.issues[0].message },
            { status: 400 }
        );
    }

    const filters = parsed.data;

    const where: Prisma.OrderItemWhereInput = {};

    // By default, cancelled items are excluded from the report — they were
    // never actually served and their money was refunded, so counting them
    // would overstate both headcount and the paid total. Pass
    // ?includeCancelled=true to see them (with itemStatus shown per row).
    if (!filters.includeCancelled) {
        where.status = "ACTIVE";
    }

    if (filters.date) {
        where.date = toDateOnly(filters.date);
    } else if (filters.jalaliYear && filters.jalaliMonth) {
        const start = jalaliToGregorian(filters.jalaliYear, filters.jalaliMonth, 1);
        const lastDay = jalaliMonthLength(filters.jalaliYear, filters.jalaliMonth);
        const end = jalaliToGregorian(filters.jalaliYear, filters.jalaliMonth, lastDay);
        where.date = { gte: toDateOnly(start), lte: toDateOnly(end) };
    }

    if (filters.schoolId || filters.gradeId) {
        where.child = {
            ...(filters.schoolId ? { schoolId: filters.schoolId } : {}),
            ...(filters.gradeId ? { gradeId: filters.gradeId } : {}),
        };
    }

    if (filters.orderStatus || filters.orderType) {
        where.order = {
            ...(filters.orderStatus ? { status: filters.orderStatus } : {}),
            ...(filters.orderType ? { type: filters.orderType } : {}),
        };
    }

    const [totalCount, totalPaidAggregate, orderItems] = await Promise.all([
        prisma.orderItem.count({ where }),
        prisma.orderItem.aggregate({
            where: {
                ...where,
                status: "ACTIVE", // refunded/cancelled money was never actually collected — never count it
                order: { ...(where.order as object ?? {}), status: "PAID" },
            },
            _sum: { unitPrice: true },
        }),
        prisma.orderItem.findMany({
            where,
            include: {
                child: { include: { school: true, grade: true } },
                menuItem: { include: { food: true } },
                order: { include: { user: true } },
            },
            orderBy: { date: "asc" },
            skip: (filters.page - 1) * filters.pageSize,
            take: filters.pageSize,
        }),
    ]);

    const rows = orderItems.map((item) => ({
        orderItemId: item.id,
        date: item.date.toISOString().split("T")[0],
        childName: `${item.child.firstName} ${item.child.lastName}`,
        schoolName: item.child.school.name,
        gradeName: item.child.grade.name,
        foodName: item.menuItem.food.name,
        portionType: item.portionType,
        amount: item.unitPrice,
        orderId: item.orderId,
        orderType: item.order.type,
        orderStatus: item.order.status,
        itemStatus: item.status,
        parentPhone: item.order.user.phone,
        orderPlacedAt: item.order.createdAt.toISOString(),
    }));

    return NextResponse.json({
        success: true,
        rows,
        totalPaidAmount: totalPaidAggregate._sum.unitPrice ?? 0,
        pagination: {
            page: filters.page,
            pageSize: filters.pageSize,
            totalCount,
            totalPages: Math.max(Math.ceil(totalCount / filters.pageSize), 1),
        },
    });
}