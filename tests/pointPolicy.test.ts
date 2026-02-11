import { describe, expect, it } from "vitest";
import { getPointPolicy, getPointsForCategory, isValidCategory } from "@/lib/pointPolicy";

describe("pointPolicy", () => {
  it("returns fixed points by category", () => {
    expect(getPointsForCategory("gratitude")).toBe(2);
    expect(getPointsForCategory("celebration")).toBe(5);
  });

  it("validates category values", () => {
    expect(isValidCategory("kindness")).toBe(true);
    expect(isValidCategory("invalid")).toBe(false);
  });

  it("exposes immutable-like policy map", () => {
    const policy = getPointPolicy();
    expect(policy.support).toBe(3);
    expect(Object.keys(policy)).toHaveLength(5);
  });
});
