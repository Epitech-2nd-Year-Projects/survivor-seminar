"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  useStartup,
  useUpdateStartup,
} from "@/lib/api/services/startups/hooks";
import type { Startup } from "@/lib/api/contracts/startups";
import EditDialogStartup from "@/components/editDialogStartup";
import { Button } from "@/components/ui/button";
import {
  Building2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Rocket,
  Tag,
  Layers,
  FileText,
  Edit3,
  CheckCircle2,
} from "lucide-react";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return typeof err === "string" ? err : JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function SuccessOverlay(props: { open: boolean; message: string | null }) {
  const { open, message } = props;
  if (!open || !message) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center">
        <div
          className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-white shadow-lg"
          style={{ animation: "popIn 220ms ease-out" }}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes popIn {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          60% {
            transform: scale(1.03);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

function AvatarBadge({ name }: { name: string }) {
  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase() || "S";
  }, [name]);

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-xl border bg-white text-xl font-bold text-slate-700 shadow-sm">
      {initials}
    </div>
  );
}

function InfoRow(props: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  href?: string | null;
}) {
  const { icon, label, value, href } = props;
  const display = value && value.trim().length > 0 ? value : "Not provided yet";

  const content =
    href && value ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group text-primary inline-flex items-center gap-1 hover:underline"
      >
        {value}
        <ExternalLink
          className="h-4 w-4 opacity-70 group-hover:opacity-100"
          aria-hidden="true"
        />
      </a>
    ) : (
      <span className={value ? "" : "text-muted-foreground"}>{display}</span>
    );

  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="min-w-0">
        <div className="text-muted-foreground text-xs font-medium">{label}</div>
        <div className="truncate text-sm">{content}</div>
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-muted-foreground text-xs">
          Profile completeness
        </span>
        <span className="text-xs font-semibold">{v}%</span>
      </div>
      <div className="bg-muted h-2 w-full rounded">
        <div
          className="h-2 rounded bg-emerald-500 transition-[width] duration-300"
          style={{ width: `${v}%` }}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={v}
          role="progressbar"
        />
      </div>
    </div>
  );
}

export default function MyStartupProfile(props: { startupId: number }) {
  const { startupId } = props;

  const { data, isLoading, isError, error, refetch } = useStartup(startupId, {
    redirectOn401: true,
  });

  const {
    mutateAsync: updateStartupAsync,
    isError: isUpdateError,
    error: updateErr,
  } = useUpdateStartup(startupId);

  const [editOpen, setEditOpen] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showSuccess(message: string) {
    setSuccessMsg(message);
    setSuccessOpen(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSuccessOpen(false), 1100);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startup: Startup | undefined = data;

  const completeness = useMemo(() => {
    if (!startup) return 0;
    const fields: (keyof Startup)[] = [
      "email",
      "phone",
      "legalStatus",
      "address",
      "websiteUrl",
      "socialMediaUrl",
      "projectStatus",
      "needs",
      "sector",
      "maturity",
      "description",
    ];
    const total = fields.length;
    const filled = fields.reduce((acc, k) => {
      const v = startup[k];
      if (typeof v === "string") {
        return acc + (v.trim().length > 0 ? 1 : 0);
      }
      return acc + (v ? 1 : 0);
    }, 0);
    return (filled / total) * 100;
  }, [startup]);

  return (
    <>
      <section className="relative isolate">
        <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
          <div className="bg-card/95 rounded-xl border p-5 shadow-xl">
            {isLoading && (
              <div className="flex items-center gap-4">
                <div className="bg-muted h-20 w-20 animate-pulse rounded-xl" />
                <div className="flex-1">
                  <div className="bg-muted mb-2 h-6 w-56 animate-pulse rounded" />
                  <div className="bg-muted h-4 w-72 animate-pulse rounded" />
                </div>
              </div>
            )}

            {isError && (
              <div className="text-destructive text-sm break-all">
                Error: {getErrorMessage(error)}
              </div>
            )}

            {startup && !isLoading && !isError && (
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <AvatarBadge name={startup.name} />
                  <div>
                    <h1 className="text-2xl font-semibold">{startup.name}</h1>
                    <p className="text-muted-foreground text-sm">
                      {startup.createdAt.toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/startups/${startup.id}`}>
                    <Button variant="secondary">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View public page
                    </Button>
                  </Link>
                  <Button onClick={() => setEditOpen(true)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit profile
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="bg-card rounded-xl border p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="text-muted-foreground h-5 w-5" />
                <h2 className="text-lg font-semibold">About</h2>
              </div>
              {isLoading && (
                <div className="space-y-2">
                  <div className="bg-muted h-4 w-full animate-pulse rounded" />
                  <div className="bg-muted h-4 w-4/5 animate-pulse rounded" />
                  <div className="bg-muted h-4 w-3/5 animate-pulse rounded" />
                </div>
              )}
              {!isLoading && (
                <p className="text-sm leading-6">
                  {startup?.description?.trim()?.length
                    ? startup.description
                    : "No description yet. Add a short overview of your company, mission, product, and traction."}
                </p>
              )}
            </div>

            <div className="bg-card rounded-xl border p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="text-muted-foreground h-5 w-5" />
                <h2 className="text-lg font-semibold">Contact & Links</h2>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={startup?.email ?? undefined}
                  href={startup?.email ? `mailto:${startup.email}` : null}
                />
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={startup?.phone ?? undefined}
                  href={startup?.phone ? `tel:${startup.phone}` : null}
                />
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Address"
                  value={startup?.address ?? undefined}
                />
                <InfoRow
                  icon={<Globe className="h-4 w-4" />}
                  label="Website"
                  value={startup?.websiteUrl ?? undefined}
                  href={startup?.websiteUrl ?? null}
                />
                <InfoRow
                  icon={<Tag className="h-4 w-4" />}
                  label="Social media"
                  value={startup?.socialMediaUrl ?? undefined}
                  href={startup?.socialMediaUrl ?? null}
                />
                <InfoRow
                  icon={<Layers className="h-4 w-4" />}
                  label="Legal status"
                  value={startup?.legalStatus ?? undefined}
                />
              </div>
            </div>

            <div className="bg-card rounded-xl border p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Rocket className="text-muted-foreground h-5 w-5" />
                <h2 className="text-lg font-semibold">Business</h2>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoRow
                  icon={<Tag className="h-4 w-4" />}
                  label="Project status"
                  value={startup?.projectStatus ?? undefined}
                />
                <InfoRow
                  icon={<Tag className="h-4 w-4" />}
                  label="Needs"
                  value={startup?.needs ?? undefined}
                />
                <InfoRow
                  icon={<Tag className="h-4 w-4" />}
                  label="Sector"
                  value={startup?.sector ?? undefined}
                />
                <InfoRow
                  icon={<Layers className="h-4 w-4" />}
                  label="Maturity"
                  value={startup?.maturity ?? undefined}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="bg-card rounded-xl border p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">Profile health</h2>
              <ProgressBar value={completeness} />
              <p className="text-muted-foreground mt-2 text-xs">
                Complete more fields to improve discoverability and trust.
              </p>
              <div className="mt-4">
                <Button className="w-full" onClick={() => setEditOpen(true)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Add missing info
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {startup && (
        <EditDialogStartup
          key={startup.id}
          open={editOpen}
          onOpenChange={setEditOpen}
          startup={startup}
          onSubmit={async (_id, body) => {
            try {
              await updateStartupAsync(body);
              showSuccess("Profile updated");
              await refetch();
            } catch {
            } finally {
              setEditOpen(false);
            }
          }}
        />
      )}

      {isUpdateError && (
        <p className="text-destructive mx-auto max-w-7xl px-4 pb-6 text-sm break-all">
          Update error: {getErrorMessage(updateErr)}
        </p>
      )}
      <SuccessOverlay open={successOpen} message={successMsg} />
    </>
  );
}
