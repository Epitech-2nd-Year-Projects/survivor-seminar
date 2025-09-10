import type { StatisticsPeriod } from "@/lib/api/contracts/statistics";

export type GetStatisticsParams = {
  period?: StatisticsPeriod;
};

export type GetTopProjectsParams = {
  period?: StatisticsPeriod;
  limit?: number;
};

export function toStatisticsQuery(p?: GetStatisticsParams): string {
  const qs = new URLSearchParams();
  if (p?.period) qs.set("period", p.period);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export function toTopProjectsQuery(p?: GetTopProjectsParams): string {
  const qs = new URLSearchParams();
  if (p?.period) qs.set("period", p.period);
  if (typeof p?.limit === "number") qs.set("limit", String(p.limit));
  const s = qs.toString();
  return s ? `?${s}` : "";
}
