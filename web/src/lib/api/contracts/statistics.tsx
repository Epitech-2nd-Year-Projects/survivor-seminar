export type StatisticsDTO = {
  total_projects: number;
  projects_growth: number;
  total_views: number;
  views_growth_percent: number;
  engagement_rate_percent: number;
  period: string;
};

export type StatisticsPeriod = "weekly" | "monthly" | "yearly";

export type Statistics = {
  totalProjects: number;
  projectsGrowth: number;
  totalViews: number;
  viewsGrowthPercent: number;
  engagementRatePercent: number;
  period: StatisticsPeriod;
};

export const mapStatistics = (dto: StatisticsDTO): Statistics => ({
  totalProjects: dto.total_projects,
  projectsGrowth: dto.projects_growth,
  totalViews: dto.total_views,
  viewsGrowthPercent: dto.views_growth_percent,
  engagementRatePercent: dto.engagement_rate_percent,
  period: dto.period as StatisticsPeriod,
});

export type TopProjectDTO = {
  project_id: number;
  title: string;
  views: number;
  likes: number;
  comments: number;
  engagement_rate_percent: number;
};

export type TopProjectsDTO = {
  period: string;
  limit: number;
  count: number;
  top_projects: TopProjectDTO[];
  generated_at: string;
};

export type TopProject = {
  projectId: number;
  title: string;
  views: number;
  likes: number;
  comments: number;
  engagementRatePercent: number;
};

export type TopProjects = {
  period: StatisticsPeriod;
  limit: number;
  count: number;
  topProjects: TopProject[];
  generatedAt: Date;
};

export const mapTopProjects = (dto: TopProjectsDTO): TopProjects => ({
  period: dto.period as StatisticsPeriod,
  limit: dto.limit,
  count: dto.count,
  topProjects: dto.top_projects.map((p) => ({
    projectId: p.project_id,
    title: p.title,
    views: p.views,
    likes: p.likes,
    comments: p.comments,
    engagementRatePercent: p.engagement_rate_percent,
  })),
  generatedAt: new Date(dto.generated_at),
});
