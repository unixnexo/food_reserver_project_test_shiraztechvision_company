// src/test/lib/school-calendar/off-day-menu-guard.test.ts
//
// Regression test for the bug: admin was able to assign menu items to
// closed days (Thu/Fri or admin-defined closures) via the API, even
// though parents could never see/order them (their date pickers already
// excluded such days) — this just created confusing orphaned admin data.
// Fixed in app/api/admin/menu-items/route.ts by checking isSchoolDay()
// before creating a MenuItem. This test pins the underlying isSchoolDay
// logic that guard relies on, using the same dates as the school-day
// suite for consistency.

import { describe, it, expect } from "vitest";
import { isSchoolDaySync } from "@/lib/school-calendar/is-school-day";

describe("off-day menu assignment guard (isSchoolDaySync)", () => {
    it("flags Thursday as not assignable", () => {
        const thursday = new Date(Date.UTC(2026, 8, 10)); // 2026-09-10
        expect(isSchoolDaySync(thursday, new Set())).toBe(false);
    });

    it("flags Friday as not assignable", () => {
        const friday = new Date(Date.UTC(2026, 8, 11)); // 2026-09-11
        expect(isSchoolDaySync(friday, new Set())).toBe(false);
    });

    it("flags an admin-closed weekday as not assignable", () => {
        const monday = new Date(Date.UTC(2026, 8, 7));
        const closures = new Set(["2026-09-07"]);
        expect(isSchoolDaySync(monday, closures)).toBe(false);
    });

    it("allows a normal open weekday", () => {
        const monday = new Date(Date.UTC(2026, 8, 7));
        expect(isSchoolDaySync(monday, new Set())).toBe(true);
    });
});