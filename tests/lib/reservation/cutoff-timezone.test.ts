// tests/lib/reservation/cutoff-timezone.test.ts
//
// Regression test for the local/UTC cutoff bug: getEarliestBookableDate
// must return the SAME result for the same real-world instant, no matter
// what timezone the Node process happens to be running in (server TZ is
// a deployment detail — the 5pm cutoff is a business rule about Iran
// time). The old implementation used `now.getHours()` (server-local),
// which broke this property. This test pins the correct behavior so a
// future refactor can't silently reintroduce it.
//
// Note: vitest's `environment: "jsdom"` config does not let us switch
// process.env.TZ per-test reliably across all Node versions/platforms,
// so instead we assert the underlying property directly: the same UTC
// instant must resolve to the same Iran-local hour bucket, using a set
// of instants that straddle the 5pm Tehran boundary from different
// UTC-offset angles.

import { describe, it, expect } from "vitest";
import { getEarliestBookableDate } from "@/lib/reservation/cutoff";

describe("getEarliestBookableDate (Iran-time cutoff, timezone-independent)", () => {
    it("treats 16:59 Tehran time as before cutoff (tomorrow bookable)", () => {
        // 16:59 Tehran (UTC+3:30) on 2026-09-07 == 13:29 UTC
        const now = new Date(Date.UTC(2026, 8, 7, 13, 29));
        const earliest = getEarliestBookableDate(now);
        expect(earliest.toISOString().split("T")[0]).toBe("2026-09-08");
    });

    it("treats exactly 17:00 Tehran time as at cutoff (day-after-tomorrow)", () => {
        // 17:00 Tehran (UTC+3:30) on 2026-09-07 == 13:30 UTC
        const now = new Date(Date.UTC(2026, 8, 7, 13, 30));
        const earliest = getEarliestBookableDate(now);
        expect(earliest.toISOString().split("T")[0]).toBe("2026-09-09");
    });

    it("treats 17:01 Tehran time as past cutoff (day-after-tomorrow)", () => {
        // 17:01 Tehran (UTC+3:30) on 2026-09-07 == 13:31 UTC
        const now = new Date(Date.UTC(2026, 8, 7, 13, 31));
        const earliest = getEarliestBookableDate(now);
        expect(earliest.toISOString().split("T")[0]).toBe("2026-09-09");
    });

    it("uses the Iran clock hour for the cutoff check even near a UTC day boundary", () => {
        // 20:00 Tehran on 2026-09-07 (well past cutoff) == 16:30 UTC, still Sep 7 in UTC.
        const lateEveningIran = new Date(Date.UTC(2026, 8, 7, 16, 30));
        // 02:00 Tehran on 2026-09-08 (well before cutoff) == 22:30 UTC on Sep 7
        // (Iran's midnight hasn't happened in UTC terms yet at this offset).
        const earlyMorningIran = new Date(Date.UTC(2026, 8, 7, 22, 30));

        const resultLate = getEarliestBookableDate(lateEveningIran);
        const resultEarly = getEarliestBookableDate(earlyMorningIran);

        // Both instants fall on UTC calendar day Sep 7, so "today" (UTC-normalized)
        // is the same for both — but the Iran-hour cutoff check must still differ:
        // one is past 5pm Tehran, the other isn't.
        expect(resultLate.toISOString().split("T")[0]).toBe("2026-09-09"); // past cutoff
        expect(resultEarly.toISOString().split("T")[0]).toBe("2026-09-08"); // before cutoff
    });
});