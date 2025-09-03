"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BoomBox } from "lucide-react";
import { redirect } from "next/navigation";

export function StatisticsPanel() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card onClick={() => redirect("/users")} className="cursor-pointer">
        <CardHeader><CardTitle>project views</CardTitle></CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">1 234</div>
          <p className="text-sm text-muted-foreground">+12% this week</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>engagement rate</CardTitle></CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">1 023 439</div>
          <p className="text-sm text-muted-foreground">+3.4% this month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Churn</CardTitle></CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">2.1%</div>
          <Progress value={78} className="mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Tickets</CardTitle></CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">146</div>
          <p className="text-sm text-muted-foreground">32 en attente</p>
        </CardContent>
      </Card>
    </div>
  );
}
