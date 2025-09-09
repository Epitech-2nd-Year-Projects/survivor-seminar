"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { statisticsKeys } from "./keys";
import { getStatisticsClient, getTopProjectsClient } from "./client";
import type { GetStatisticsParams, GetTopProjectsParams } from "./shared";

export function useStatistics(p?: GetStatisticsParams) {
  return useQuery({
    queryKey: statisticsKeys.overview(p),
    queryFn: () => getStatisticsClient(p),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useTopProjects(p?: GetTopProjectsParams) {
  return useQuery({
    queryKey: statisticsKeys.topProjects(p),
    queryFn: () => getTopProjectsClient(p),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
