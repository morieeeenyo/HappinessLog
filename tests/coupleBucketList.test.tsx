import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CoupleBucketListApp } from "@/components/CoupleBucketListApp";

describe("CoupleBucketListApp", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds a new wish item", () => {
    render(<CoupleBucketListApp />);

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "記念日に夜景を見に行く" }
    });
    fireEvent.change(screen.getByLabelText("メモ"), {
      target: { value: "早めにレストランを探す" }
    });
    fireEvent.click(screen.getByRole("button", { name: "追加する" }));

    expect(screen.getByText("記念日に夜景を見に行く")).toBeInTheDocument();
    expect(screen.getByText("早めにレストランを探す")).toBeInTheDocument();
  });

  it("cycles item status", () => {
    render(<CoupleBucketListApp />);

    const planningButtons = screen.getAllByRole("button", { name: "相談中" });
    fireEvent.click(planningButtons[0]);

    expect(screen.getAllByRole("button", { name: "予定あり" }).length).toBeGreaterThan(0);
  });
});
