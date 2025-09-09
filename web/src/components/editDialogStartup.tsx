"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
  const [legalStatus, setLegalStatus] = React.useState<string | undefined>();
  const [sector, setSector] = React.useState<string | undefined>();
  const [maturity, setMaturity] = React.useState<string | undefined>();
  const [projectStatus, setProjectStatus] = React.useState<
    string | undefined
  >();

  React.useEffect(() => {
    setLegalStatus(undefined);
    setSector(undefined);
    setMaturity(undefined);
    setProjectStatus(undefined);
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
            onSubmit={(e) => {
              e.preventDefault();
              if (!startup) return;

              const fd = new FormData(e.currentTarget);

              const nameInput = getFDString(fd, "name").trim();
              const emailInput = getFDString(fd, "email").trim();
              const phoneInput = getFDString(fd, "phone").trim();
              const legalStatusInput = getFDString(fd, "legalStatus").trim();
              const addressInput = getFDString(fd, "address").trim();
              const websiteUrlInput = getFDString(fd, "websiteUrl").trim();
              const socialUrlInput = getFDString(fd, "socialMediaUrl").trim();
              const projectStatusInput = getFDString(
                fd,
                "projectStatus",
              ).trim();
              const needsInput = getFDString(fd, "needs").trim();
              const sectorInput = getFDString(fd, "sector").trim();
              const maturityInput = getFDString(fd, "maturity").trim();
              const descriptionInput = getFDString(fd, "description").trim();

              const startupBody: UpdateStartupBody = {
                id: startup.id,
                name: nameInput ?? startup.name,
                email: emailInput ?? startup.email ?? null,
                phone: phoneInput ?? startup.phone ?? null,
                legal_status: legalStatusInput ?? startup.legalStatus ?? null,
                address: addressInput ?? startup.address ?? null,
                website_url: websiteUrlInput ?? startup.websiteUrl ?? null,
                social_media_url:
                  socialUrlInput ?? startup.socialMediaUrl ?? null,
                project_status:
                  projectStatusInput ?? startup.projectStatus ?? null,
                needs: needsInput ?? startup.needs ?? null,
                sector: sectorInput ?? startup.sector ?? null,
                maturity: maturityInput ?? startup.maturity ?? null,
                description: descriptionInput ?? startup.description ?? null,
              };

              void onSubmit(startup.id, startupBody);
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
                <Select value={legalStatus} onValueChange={setLegalStatus}>
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
                <input
                  type="hidden"
                  name="legalStatus"
                  value={legalStatus ?? ""}
                />
              </div>

              <div className="grid gap-2">
                <Label>Sector</Label>
                <Select value={sector} onValueChange={setSector}>
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
                <input type="hidden" name="sector" value={sector ?? ""} />
              </div>

              <div className="grid gap-2">
                <Label>Maturity</Label>
                <Select value={maturity} onValueChange={setMaturity}>
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
                <input type="hidden" name="maturity" value={maturity ?? ""} />
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
                <Select value={projectStatus} onValueChange={setProjectStatus}>
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
                <input
                  type="hidden"
                  name="projectStatus"
                  value={projectStatus ?? ""}
                />
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
