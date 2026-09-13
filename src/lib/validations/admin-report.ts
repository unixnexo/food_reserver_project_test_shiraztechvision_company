// src/lib/validations/admin-report.ts

import { z } from "zod";

export const adminReportFilterSchema = z.object({
    schoolId: z.string().optional(),
    gradeId: z.string().optional(),
    // Exact single day (YYYY-MM-DD). Mutually exclusive with month in practice,
    // but both are accepted independently — if both given, both apply (AND).
    date: z.coerce.date().optional(),
    // Month scoped as a Jalali year+month pair, resolved to a Gregorian range
    // server-side (see route implementation) — sending raw Gregorian bounds
    // from the client would require the client to do Jalali math itself.
    jalaliYear: z.coerce.number().int().optional(),
    jalaliMonth: z.coerce.number().int().min(1).max(12).optional(),
    orderStatus: z.enum(["PENDING", "PAID", "FAILED"]).optional(),
    orderType: z.enum(["DAILY", "MONTHLY"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(200).default(50),
});

export type AdminReportFilterInput = z.infer<typeof adminReportFilterSchema>;