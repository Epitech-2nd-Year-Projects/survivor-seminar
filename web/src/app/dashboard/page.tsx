"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  useStatistics,
  useTopProjects,
} from "@/lib/api/services/statistics/hooks";
import { userMessageFromError } from "@/lib/api/http/messages";

export default function StatisticsPage() {
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
    error: errorStats,
  } = useStatistics();
  const {
    data: topProjects,
    isLoading: isLoadingTopProjects,
    isError: isErrorTopProjects,
    error: errorTopProjects,
  } = useTopProjects({ period: "weekly", limit: 3 });

  if (isErrorStats) {
    console.log(errorStats);
    return <div>Error: {userMessageFromError(errorStats)}</div>;
  }

  if (isErrorTopProjects) {
    console.log(errorTopProjects);
    return <div>Error: {userMessageFromError(errorTopProjects)}</div>;
  }

  const showSkeletonsStats = isLoadingStats && !stats;
  const showSkeletonsTopProjects = isLoadingTopProjects && !topProjects;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div>
        <h1 className="text-xl font-semibold">Statistics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/projects">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">128</div>
              <p className="text-muted-foreground text-sm">
                <span className="font-bold">+6</span> this week
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Project views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalViews}</div>
            <p className="text-muted-foreground text-sm">
              <span className="font-bold">{stats?.viewsGrowthPercent}%</span> vs
              the last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.engagementRatePercent}%
            </div>
            <Progress value={54} className="mt-2" />
          </CardContent>
        </Card>
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Top projects (This week)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground text-left">
                <tr>
                  <th className="py-2">Project</th>
                  <th className="py-2">View</th>
                  <th className="py-2">Engagement</th>
                </tr>
              </thead>
              {topProjects?.topProjects.map((project) => {
                return (
                  <tbody key={project.projectId}>
                    <tr className="border-t">
                      <td className="py-2">{project.title}</td>
                      <td className="py-2">{project.views}</td>
                      <td className="py-2">{project.engagementRatePercent}</td>
                    </tr>
                  </tbody>
                );
              })}
            </table>
          </div>
          <div className="mt-4 flex gap-2">
            <Button asChild size="sm">
              <Link href="/projects">View all project</Link>
            </Button>
            <Button size="sm" variant="outline">
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
