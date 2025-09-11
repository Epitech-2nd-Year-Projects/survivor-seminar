"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/animate-ui/components/radix/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateStartupBody } from "@/lib/api/services/startups/client";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (values: CreateStartupBody) => void | Promise<void>;
  description?: string;
};

const getFDString = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

const LEGAL_OPTIONS = [
  "AS",
  "BV",
  "GmbH",
  "Kft",
  "Ltd",
  "Oy",
  "SARL",
  "SAS",
  "SpA",
] as const;
const SECTOR_OPTIONS = [
  "DeepTech",
  "FinTech",
  "SaaS",
  "Logistics",
  "Sustainability",
  "EdTech",
  "HealthTech",
] as const;
const MATURITY_OPTIONS = [
  "Idea",
  "Prototype",
  "MVP",
  "Product-Market Fit",
] as const;
const STATUS_OPTIONS = [
  "Early Stage",
  "Seed",
  "Growth",
  "Scale-up",
  "draft",
  "building",
  "launched",
  "hiring",
  "fundraising",
  "paused",
  "closed",
] as const;

export default function CreateDialogStartup({
  open,
  onOpenChange,
  onSubmit,
  description = "Create a new startup",
}: Props) {
  const [legalStatusSel, setLegalStatusSel] = React.useState<string>();
  const [sectorSel, setSectorSel] = React.useState<string>();
  const [maturitySel, setMaturitySel] = React.useState<string>();
  const [projectStatusSel, setProjectStatusSel] = React.useState<string>();

  React.useEffect(() => {
    if (!open) {
      setLegalStatusSel(undefined);
      setSectorSel(undefined);
      setMaturitySel(undefined);
      setProjectStatusSel(undefined);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[min(100vw-1rem,720px)] flex-col overflow-hidden rounded-2xl p-0 sm:h-auto sm:max-h-[85vh] sm:max-w-[720px]">
        <DialogHeader className="border-b px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="text-base sm:text-lg">
            Create Startup
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <form
            id="create-startup-form"
            className="grid gap-5"
            onSubmit={async (e) => {
              e.preventDefault();

              const fd = new FormData(e.currentTarget);

              const name = getFDString(fd, "name").trim();
              const email = getFDString(fd, "email").trim();
              const phone = getFDString(fd, "phone").trim();
              const address = getFDString(fd, "address").trim();
              const websiteUrl = getFDString(fd, "websiteUrl").trim();
              const socialUrl = getFDString(fd, "socialMediaUrl").trim();
              const needs = getFDString(fd, "needs").trim();
              const descriptionInput = getFDString(fd, "description").trim();

              if (!name) return;

              const body: CreateStartupBody = { name } as CreateStartupBody;

              if (email) body.email = email;
              if (phone) body.phone = phone;
              if (typeof legalStatusSel !== "undefined")
                body.legal_status = legalStatusSel;
              if (address) body.address = address;
              if (websiteUrl) body.website_url = websiteUrl;
              if (socialUrl) body.social_media_url = socialUrl;
              if (typeof projectStatusSel !== "undefined")
                body.project_status = projectStatusSel;
              if (needs) body.needs = needs;
              if (typeof sectorSel !== "undefined") body.sector = sectorSel;
              if (typeof maturitySel !== "undefined")
                body.maturity = maturitySel;
              if (descriptionInput) body.description = descriptionInput;

              await onSubmit(body);
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="organization"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-2">
                <Label>Legal status</Label>
                <Select
                  value={legalStatusSel}
                  onValueChange={setLegalStatusSel}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select legal status" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {LEGAL_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Sector</Label>
                <Select value={sectorSel} onValueChange={setSectorSel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {SECTOR_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Maturity</Label>
                <Select value={maturitySel} onValueChange={setMaturitySel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select maturity" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {MATURITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  autoComplete="url"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="socialMediaUrl">Social media URL</Label>
                <Input id="socialMediaUrl" name="socialMediaUrl" type="url" />
              </div>

              <div className="grid gap-2">
                <Label>Project status</Label>
                <Select
                  value={projectStatusSel}
                  onValueChange={setProjectStatusSel}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                className="min-h-[70px] resize-none"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="needs">Needs</Label>
              <Textarea
                id="needs"
                name="needs"
                className="min-h-[70px] resize-none"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                className="min-h-[110px] resize-none"
              />
            </div>
          </form>
        </div>

        <DialogFooter className="gap-2 border-t px-4 py-3 sm:px-6 sm:py-4">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="create-startup-form"
            className="w-full sm:w-auto"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
