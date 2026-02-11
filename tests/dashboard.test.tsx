import React from "react";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardView } from "@/components/DashboardView";

vi.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    LineChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    XAxis: () => <div />,
    YAxis: () => <div />,
    Tooltip: () => <div />,
    Line: () => <div />
  };
});

describe("DashboardView", () => {
  it("renders summary values", () => {
    render(
      <DashboardView
        summary={{
          monthKey: "2026-02",
          totalPoints: 42,
          targetPoints: 100,
          remainingPoints: 58,
          progressPercent: 42
        }}
        series={[
          { date: "02/01", points: 10, cumulative: 10 },
          { date: "02/02", points: 32, cumulative: 42 }
        ]}
      />
    );

    expect(screen.getByText("今月の合計ポイント")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
  });
});
