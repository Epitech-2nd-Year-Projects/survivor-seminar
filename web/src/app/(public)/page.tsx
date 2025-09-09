import Link from "next/link";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Rocket, ShieldCheck, Zap } from "lucide-react";
import { LandingGridBeams } from "@/components/landing/landing-grid-beams";
import { listNewsServer } from "@/lib/api/services/news/server";
import { listEventsServer } from "@/lib/api/services/events/server";
import { listStartupsServer } from "@/lib/api/services/startups/server";
import { Marquee } from "@/components/magicui/marquee";
import { cn } from "@/lib/utils";
import { LandingParticles } from "@/components/landing/landing-particles";

export default async function LandingPage() {
  const [news, events, startups] = await Promise.all([
    listNewsServer({ perPage: 12, sort: "created_at", order: "desc" }, 60),
    listEventsServer({ perPage: 12, sort: "created_at", order: "desc" }, 60),
    listStartupsServer({ perPage: 24 }, 60),
  ]);

  const newsProducts = news.data
    .filter((n) => !!n.imageUrl)
    .slice(0, 8)
    .map((n) => ({ title: n.title, link: "/news", thumbnail: n.imageUrl! }));

  const eventProducts = events.data
    .filter((e) => !!e.imageUrl)
    .slice(0, 8)
    .map((e) => ({ title: e.name, link: "/events", thumbnail: e.imageUrl! }));

  const products = [...newsProducts, ...eventProducts].slice(0, 15);
  return (
    <main className="relative space-y-24 pb-24">
      <LandingParticles />
      {/* Hero Parallax (Aceternity-inspired) */}
      <HeroParallax products={products} />

      {/* Startups Marquee */}
      <section className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mx-auto mb-6 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Startups mises en avant
          </h2>
          <p className="mt-2 text-muted-foreground">Découvrez une sélection de projets de l’écosystème.</p>
        </div>

        <div className="relative space-y-6">
          <Marquee pauseOnHover className="[--gap:1.25rem] [--duration:50s]">
            {startups.data.map((s) => (
              <StartupCard key={s.id} id={s.id} name={s.name} sector={s.sector ?? undefined} description={s.description ?? undefined} />
            ))}
          </Marquee>
          <Marquee pauseOnHover reverse className="[--gap:1.25rem] [--duration:50s]">
            {startups.data
              .slice()
              .reverse()
              .map((s) => (
                <StartupCard key={`r-${s.id}`} id={s.id} name={s.name} sector={s.sector ?? undefined} description={s.description ?? undefined} />
              ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-background" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-background" />
        </div>
      </section>
    </main>
  );
}

function StartupCard({ id, name, sector, description }: { id: number; name: string; sector?: string; description?: string }) {
  const username = `@${slugify(name)}`;
  const body = (description ?? "").slice(0, 120) || "Découvrez cette startup prometteuse de notre écosystème.";
  const img = `https://avatar.vercel.sh/${encodeURIComponent(name)}?size=64`;

  return (
    <Link href={`/startups/${id}`} className="focus:outline-none">
      <figure
        className={cn(
          "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
          "border-border/60 bg-card hover:bg-accent/10",
        )}
      >
        <div className="flex flex-row items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rounded-full" width="32" height="32" alt="" src={img} />
          <div className="flex flex-col">
            <figcaption className="text-sm font-medium">{name}</figcaption>
            <p className="text-xs font-medium text-muted-foreground">{sector ? `${username} · ${sector}` : username}</p>
          </div>
        </div>
        <blockquote className="mt-2 line-clamp-3 text-sm text-muted-foreground">{body}</blockquote>
      </figure>
    </Link>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 18);
}
