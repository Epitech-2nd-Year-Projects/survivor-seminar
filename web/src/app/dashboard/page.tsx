import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type ProjectStat = {
  id: string;
  name: string;
  sector: string;
  views: number;
  engagement: number;
};

const data: {
  project: ProjectStat[];
} = {
  project: [
    {
      id: "1",
      name: "NeoCharge",
      sector: "Energy",
      views: 1120,
      engagement: 61,
    },
    {
      id: "2",
      name: "AgriSense",
      sector: "AgriTech",
      views: 940,
      engagement: 57,
    },
    {
      id: "3",
      name: "FleetAI",
      sector: "Mobility",
      views: 786,
      engagement: 49,
    },
  ],
};

export default function StatisticsPage() {
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
            <div className="text-3xl font-bold">4 920</div>
            <p className="text-muted-foreground text-sm">
              <span className="font-bold">+12%</span> vs the last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">54%</div>
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
                  <th className="py-2">Secteur</th>
                  <th className="py-2">View</th>
                  <th className="py-2">Engagement</th>
                </tr>
              </thead>
              {data.project.map((project) => {
                return (
                  <tbody key={project.id}>
                    <tr className="border-t">
                      <td className="py-2">{project.name}</td>
                      <td className="py-2">{project.sector}</td>
                      <td className="py-2">{project.views}</td>
                      <td className="py-2">{project.engagement}</td>
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
