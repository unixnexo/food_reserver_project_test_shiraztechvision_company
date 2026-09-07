// src/test/lib/reservation/cutoff.test.ts

import { describe, it, expect } from "vitest";
import { getEarliestBookableDate, isDateBookable } from "@/lib/reservation/cutoff";

describe("getEarliestBookableDate", () => {
    it("returns tomorrow when before 5pm", () => {
        const now = new Date(2026, 8, 7, 14, 0); // Sep 7, 2026, 2:00 PM local
        const earliest = getEarliestBookableDate(now);
        expect(earliest.toISOString().split("T")[0]).toBe("2026-09-08");
    });

    it("returns day-after-tomorrow when exactly at 5pm", () => {
        const now = new Date(2026, 8, 7, 17, 0); // exactly 5:00 PM
        const earliest = getEarliestBookableDate(now);
        expect(earliest.toISOString().split("T")[0]).toBe("2026-09-09");
    });

    it("returns day-after-tomorrow when after 5pm", () => {
        const now = new Date(2026, 8, 7, 20, 30); // 8:30 PM
        const earliest = getEarliestBookableDate(now);
        expect(earliest.toISOString().split("T")[0]).toBe("2026-09-09");
    });

    it("returns tomorrow when just before 5pm", () => {
        const now = new Date(2026, 8, 7, 16, 59);
        const earliest = getEarliestBookableDate(now);
        expect(earliest.toISOString().split("T")[0]).toBe("2026-09-08");
    });
});

describe("isDateBookable", () => {
    const now = new Date(2026, 8, 7, 14, 0); // before 5pm on Sep 7

    it("rejects today", () => {
        const today = new Date(Date.UTC(2026, 8, 7));
        expect(isDateBookable(today, now)).toBe(false);
    });

    it("accepts tomorrow (before cutoff)", () => {
        const tomorrow = new Date(Date.UTC(2026, 8, 8));
        expect(isDateBookable(tomorrow, now)).toBe(true);
    });

    it("accepts a date far in the future", () => {
        const future = new Date(Date.UTC(2026, 8, 20));
        expect(isDateBookable(future, now)).toBe(true);
    });

    it("rejects a past date", () => {
        const past = new Date(Date.UTC(2026, 8, 1));
        expect(isDateBookable(past, now)).toBe(false);
    });

    it("rejects tomorrow when past the 5pm cutoff", () => {
        const lateNow = new Date(2026, 8, 7, 18, 0);
        const tomorrow = new Date(Date.UTC(2026, 8, 8));
        expect(isDateBookable(tomorrow, lateNow)).toBe(false);
    });

    it("accepts day-after-tomorrow when past the 5pm cutoff", () => {
        const lateNow = new Date(2026, 8, 7, 18, 0);
        const dayAfterTomorrow = new Date(Date.UTC(2026, 8, 9));
        expect(isDateBookable(dayAfterTomorrow, lateNow)).toBe(true);
    });
});