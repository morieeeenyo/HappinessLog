import { describe, expect, it } from "vitest";
import { aggregateMonthlyPoints, buildDailySeries, sumPoints, type HappinessLog } from "@/lib/pointAggregator";

const logs: HappinessLog[] = [
  { id: "1", occurredAt: "2026-02-01T10:00:00.000Z", points: 3 },
  { id: "2", occurredAt: "2026-02-02T10:00:00.000Z", points: 5 },
  { id: "3", occurredAt: "2026-01-31T10:00:00.000Z", points: 9 }
];

describe("pointAggregator", () => {
  it("sums all points", () => {
    expect(sumPoints(logs)).toBe(17);
  });

  it("aggregates only current month points", () => {
    const summary = aggregateMonthlyPoints(logs, 20, new Date("2026-02-15T00:00:00.000Z"));
    expect(summary.totalPoints).toBe(8);
    expect(summary.remainingPoints).toBe(12);
    expect(summary.progressPercent).toBe(40);
  });

  it("builds daily cumulative series", () => {
    const series = buildDailySeries(logs, new Date("2026-02-10T00:00:00.000Z"));
    expect(series[0]).toEqual({ date: "02/01", points: 3, cumulative: 3 });
    expect(series[1]).toEqual({ date: "02/02", points: 5, cumulative: 8 });
    expect(series[2].cumulative).toBe(8);
  });
});
