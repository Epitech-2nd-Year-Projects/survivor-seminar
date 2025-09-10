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
import type { Startup } from "@/lib/api/contracts/startups";
import type { UpdateStartupBody } from "@/lib/api/services/startups/client";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  startup: Startup | null;
  onSubmit: (id: number, values: UpdateStartupBody) => void | Promise<void>;
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

export default function EditDialogStartup({
  open,
  onOpenChange,
  startup,
  onSubmit,
  description = "Edit the startup data",
}: Props) {
  const [legalStatusSel, setLegalStatusSel] = React.useState<
    string | undefined
  >();
  const [sectorSel, setSectorSel] = React.useState<string | undefined>();
  const [maturitySel, setMaturitySel] = React.useState<string | undefined>();
  const [projectStatusSel, setProjectStatusSel] = React.useState<
    string | undefined
  >();

  React.useEffect(() => {
    setLegalStatusSel(undefined);
    setSectorSel(undefined);
    setMaturitySel(undefined);
    setProjectStatusSel(undefined);
  }, [startup?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[min(100vw-1rem,720px)] flex-col overflow-hidden rounded-2xl p-0 sm:h-auto sm:max-h-[85vh] sm:max-w-[720px]">
        <DialogHeader className="border-b px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="text-base sm:text-lg">
            Edit Startup
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <form
            id="edit-startup-form"
            className="grid gap-5"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!startup) return;

              const fd = new FormData(e.currentTarget);

              const name = getFDString(fd, "name").trim();
              const email = getFDString(fd, "email").trim();
              const phone = getFDString(fd, "phone").trim();
              const address = getFDString(fd, "address").trim();
              const websiteUrl = getFDString(fd, "websiteUrl").trim();
              const socialUrl = getFDString(fd, "socialMediaUrl").trim();
              const needs = getFDString(fd, "needs").trim();
              const descriptionInput = getFDString(fd, "description").trim();

              const body: UpdateStartupBody = {} as UpdateStartupBody;

              if (name && name !== (startup.name ?? "")) body.name = name;
              if (email && email !== (startup.email ?? "")) body.email = email;
              if (phone && phone !== (startup.phone ?? "")) body.phone = phone;

              if (
                typeof legalStatusSel !== "undefined" &&
                legalStatusSel !== (startup.legalStatus ?? "")
              ) {
                body.legal_status = legalStatusSel;
              }
              if (address && address !== (startup.address ?? ""))
                body.address = address;

              if (websiteUrl && websiteUrl !== (startup.websiteUrl ?? ""))
                body.website_url = websiteUrl;
              if (socialUrl && socialUrl !== (startup.socialMediaUrl ?? ""))
                body.social_media_url = socialUrl;

              if (
                typeof projectStatusSel !== "undefined" &&
                projectStatusSel !== (startup.projectStatus ?? "")
              ) {
                body.project_status = projectStatusSel;
              }

              if (needs && needs !== (startup.needs ?? "")) body.needs = needs;

              if (
                typeof sectorSel !== "undefined" &&
                sectorSel !== (startup.sector ?? "")
              ) {
                body.sector = sectorSel;
              }
              if (
                typeof maturitySel !== "undefined" &&
                maturitySel !== (startup.maturity ?? "")
              ) {
                body.maturity = maturitySel;
              }

              if (
                descriptionInput &&
                descriptionInput !== (startup.description ?? "")
              ) {
                body.description = descriptionInput;
              }

              // If nothing changed, do NOT call API
              if (Object.keys(body).length === 0) return;

              await onSubmit(startup.id, body);
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="organization"
                  placeholder={startup?.name ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={startup?.email ?? ""}
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
                  placeholder={startup?.phone ?? ""}
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
                    <SelectValue
                      placeholder={
                        startup?.legalStatus ?? "Select legal status"
                      }
                    />
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
                    <SelectValue
                      placeholder={startup?.sector ?? "Select sector"}
                    />
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
                    <SelectValue
                      placeholder={startup?.maturity ?? "Select maturity"}
                    />
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
                  placeholder={startup?.websiteUrl ?? "https://..."}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="socialMediaUrl">Social media URL</Label>
                <Input
                  id="socialMediaUrl"
                  name="socialMediaUrl"
                  type="url"
                  placeholder={startup?.socialMediaUrl ?? "https://..."}
                />
              </div>

              <div className="grid gap-2">
                <Label>Project status</Label>
                <Select
                  value={projectStatusSel}
                  onValueChange={setProjectStatusSel}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={startup?.projectStatus ?? "Select status"}
                    />
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
                placeholder={startup?.address ?? ""}
                className="min-h-[70px] resize-none"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="needs">Needs</Label>
              <Textarea
                id="needs"
                name="needs"
                placeholder={startup?.needs ?? ""}
                className="min-h-[70px] resize-none"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={startup?.description ?? ""}
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
            form="edit-startup-form"
            className="w-full sm:w-auto"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
