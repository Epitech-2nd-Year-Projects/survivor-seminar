"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const sectors = ["Energy", "AgriTech", "Mobility", "FinTech"] as const;
const maturities = ["MVP", "Seed", "Series A"] as const;
const statuses = ["draft", "published", "archived"] as const;

export default function NewProjectPage() {
  const router = useRouter();

  const [form, setForm] = React.useState({
    name: "",
    sector: sectors[0],
    maturity: maturities[0],
    location: "",
    status: statuses[0],
    description: "",
    website: "",
  });
  const [saving, setSaving] = React.useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Démo simple : pas d’API. Remplace par un POST quand tu veux.
      // await fetch("/api/projects", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ ...form, updatedAt: new Date().toISOString() }),
      // });
      alert("Project created (demo).");
      router.push("/dashboard/content?created=1");
    } catch {
      alert("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">New Project</h1>
          <p className="text-sm text-muted-foreground">Simple form (shadcn).</p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Project details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="sector">Sector</Label>
                <Select value={form.sector} onValueChange={(v) => update("sector", v)}>
                  <SelectTrigger id="sector">
                    <SelectValue placeholder="Select a sector" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {sectors.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maturity">Maturity</Label>
                <Select value={form.maturity} onValueChange={(v) => update("maturity", v)}>
                  <SelectTrigger id="maturity">
                    <SelectValue placeholder="Select a maturity" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {maturities.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(v) => update("status", v)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Create"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/content">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
