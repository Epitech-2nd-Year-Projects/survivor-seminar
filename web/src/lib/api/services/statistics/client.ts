import { apiFetchClient } from "@/lib/api/http/client";
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

export async function getStatisticsClient(p?: GetStatisticsParams) {
  const res = await apiFetchClient<StatisticsDTO>(
    `/admin/statistics${toStatisticsQuery(p)}`,
  );
  return mapStatistics(res);
}

export async function getTopProjectsClient(p?: GetTopProjectsParams) {
  const res = await apiFetchClient<TopProjectsDTO>(
    `/admin/statistics/top${toTopProjectsQuery(p)}`,
  );
  return mapTopProjects(res);
}
