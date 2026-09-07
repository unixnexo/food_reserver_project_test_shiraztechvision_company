// src/test/lib/school-calendar/is-school-day.test.ts

import { describe, it, expect } from "vitest";
import { isSchoolDaySync } from "@/lib/school-calendar/is-school-day";

// Reference: 2026-09-07 is a Monday (per the conversation's stated "current date").
// UTC day-of-week: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6

describe("isSchoolDaySync", () => {
    const noClosures = new Set<string>();

    it("treats a Monday as a school day by default", () => {
        const monday = new Date(Date.UTC(2026, 8, 7)); // 2026-09-07
        expect(isSchoolDaySync(monday, noClosures)).toBe(true);
    });

    it("treats Thursday as closed by default", () => {
        const thursday = new Date(Date.UTC(2026, 8, 10)); // 2026-09-10
        expect(isSchoolDaySync(thursday, noClosures)).toBe(false);
    });

    it("treats Friday as closed by default", () => {
        const friday = new Date(Date.UTC(2026, 8, 11)); // 2026-09-11
        expect(isSchoolDaySync(friday, noClosures)).toBe(false);
    });

    it("treats an extra closed date (e.g. a Monday holiday) as closed", () => {
        const monday = new Date(Date.UTC(2026, 8, 7));
        const closures = new Set(["2026-09-07"]);
        expect(isSchoolDaySync(monday, closures)).toBe(false);
    });

    it("does not let an unrelated closure affect a different date", () => {
        const monday = new Date(Date.UTC(2026, 8, 7));
        const closures = new Set(["2026-09-14"]); // a different Monday
        expect(isSchoolDaySync(monday, closures)).toBe(true);
    });

    it("normalizes time-of-day before comparing (midnight vs noon same day)", () => {
        const mondayNoon = new Date(Date.UTC(2026, 8, 7, 12, 30));
        const closures = new Set(["2026-09-07"]);
        expect(isSchoolDaySync(mondayNoon, closures)).toBe(false);
    });
});