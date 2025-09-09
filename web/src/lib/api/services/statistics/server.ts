import "server-only";
import { apiFetchServer } from "@/lib/api/http/server";
import {
  mapStatistics,
  mapTopProjects,
  type StatisticsDTO,
  type TopProjectsDTO,
} from "@/lib/api/contracts/statistics";
import {
  toStatisticsQuery,
  toTopProjectsQuery,
  type GetStatisticsParams,
  type GetTopProjectsParams,
} from "./shared";

export async function getStatisticsServer(
  p?: GetStatisticsParams,
  revalidate = 60,
) {
  const res = await apiFetchServer<StatisticsDTO>(
    `/admin/statistics${toStatisticsQuery(p)}`,
    { next: { revalidate, tags: ["statistics"] } },
  );
  return mapStatistics(res);
}

export async function getTopProjectsServer(
  p?: GetTopProjectsParams,
  revalidate = 60,
) {
  const res = await apiFetchServer<TopProjectsDTO>(
    `/admin/statistics/top${toTopProjectsQuery(p)}`,
    { next: { revalidate, tags: ["statistics:top-projects"] } },
  );
  return mapTopProjects(res);
}
