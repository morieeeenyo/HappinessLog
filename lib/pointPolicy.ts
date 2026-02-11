export type HappinessCategory = "gratitude" | "kindness" | "teamwork" | "celebration" | "support";

const POINT_POLICY: Record<HappinessCategory, number> = {
  gratitude: 2,
  kindness: 3,
  teamwork: 4,
  celebration: 5,
  support: 3
};

export function getPointPolicy(): Readonly<Record<HappinessCategory, number>> {
  return POINT_POLICY;
}

export function getPointsForCategory(category: HappinessCategory): number {
  return POINT_POLICY[category];
}

export function isValidCategory(value: string): value is HappinessCategory {
  return value in POINT_POLICY;
}
