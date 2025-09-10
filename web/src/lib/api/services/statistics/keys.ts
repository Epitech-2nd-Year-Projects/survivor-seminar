import type { GetStatisticsParams, GetTopProjectsParams } from "./shared";

export const statisticsKeys = {
  all: ["statistics"] as const,
  overview: (p?: GetStatisticsParams) =>
    [...statisticsKeys.all, "overview", p] as const,
  topProjects: (p?: GetTopProjectsParams) =>
    [...statisticsKeys.all, "top-projects", p] as const,
};
