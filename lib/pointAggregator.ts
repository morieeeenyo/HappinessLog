export type HappinessLog = {
  id: string;
  occurredAt: string;
  points: number;
};

export type MonthlySummary = {
  monthKey: string;
  totalPoints: number;
  targetPoints: number;
  remainingPoints: number;
  progressPercent: number;
};

function toMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function sumPoints(logs: HappinessLog[]): number {
  return logs.reduce((total, log) => total + log.points, 0);
}

export function aggregateMonthlyPoints(
  logs: HappinessLog[],
  targetPoints: number,
  referenceDate = new Date()
): MonthlySummary {
  const currentMonth = toMonthKey(referenceDate);
  const monthlyLogs = logs.filter((log) => toMonthKey(new Date(log.occurredAt)) === currentMonth);
  const totalPoints = sumPoints(monthlyLogs);
  const remainingPoints = Math.max(targetPoints - totalPoints, 0);
  const progressPercent = targetPoints === 0 ? 0 : Math.min(Math.round((totalPoints / targetPoints) * 100), 100);

  return {
    monthKey: currentMonth,
    totalPoints,
    targetPoints,
    remainingPoints,
    progressPercent
  };
}

export type DailySeriesPoint = {
  date: string;
  points: number;
  cumulative: number;
};

export function buildDailySeries(logs: HappinessLog[], referenceDate = new Date()): DailySeriesPoint[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dayPoints = new Map<number, number>();
  logs.forEach((log) => {
    const date = new Date(log.occurredAt);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const day = date.getDate();
      dayPoints.set(day, (dayPoints.get(day) ?? 0) + log.points);
    }
  });

  let cumulative = 0;
  const series: DailySeriesPoint[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const points = dayPoints.get(day) ?? 0;
    cumulative += points;
    series.push({
      date: `${String(month + 1).padStart(2, "0")}/${String(day).padStart(2, "0")}`,
      points,
      cumulative
    });
  }

  return series;
}
