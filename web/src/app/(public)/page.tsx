import Link from "next/link";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Rocket, Zap } from "lucide-react";
import { LandingGridBeams } from "@/components/landing/landing-grid-beams";
import { listNewsServer } from "@/lib/api/services/news/server";
import { listEventsServer } from "@/lib/api/services/events/server";
import { listStartupsServer } from "@/lib/api/services/startups/server";
import { Marquee } from "@/components/magicui/marquee";
import { cn } from "@/lib/utils";
import { LandingParticles } from "@/components/landing/landing-particles";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FileTextIcon } from "@radix-ui/react-icons";

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
      <HeroParallax products={products} />

      <section className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mx-auto mb-6 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Our impact</h2>
          <p className="mt-2 text-muted-foreground">Key metrics that reflect traction and ecosystem growth.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard value="120+" label="Startups incubated" />
          <KpiCard value="€15M+" label="Funding raised" />
          <KpiCard value="60+" label="Active partners" />
          <KpiCard value="200+" label="Events organized" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mx-auto mb-6 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Featured startups</h2>
          <p className="mt-2 text-muted-foreground">A curated selection from our ecosystem.</p>
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

      <section className="mx-auto max-w-6xl px-6 sm:px-10">
        <BentoGrid>
          <BentoCard
            Icon={FileTextIcon}
            name="Latest news"
            description="Funding, competitions, and highlights."
            href="/news"
            cta="Read more"
            className="col-span-3 lg:col-span-2"
            background={
              <Marquee
                pauseOnHover
                className="absolute top-10 [--duration:26s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
              >
                {news.data.slice(0, 12).map((n) => (
                  <figure
                    key={n.id}
                    className={cn(
                      "relative w-40 cursor-pointer overflow-hidden rounded-xl border p-4",
                      "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                      "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                      "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none",
                    )}
                  >
                    <div className="text-sm font-medium line-clamp-2">{n.title}</div>
                    <blockquote className="mt-2 text-xs text-muted-foreground line-clamp-3">
                      Latest insights from our ecosystem.
                    </blockquote>
                  </figure>
                ))}
              </Marquee>
            }
          />
          <BentoCard
            Icon={CalendarIcon}
            name="Events calendar"
            description="Conferences, pitch sessions, and workshops."
            href="/events"
            cta="Open calendar"
            className="col-span-3 lg:col-span-1"
            background={
              <Calendar
                mode="single"
                selected={new Date()}
                className="absolute right-2 top-6 origin-top scale-90 rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-95"
              />
            }
          />
        </BentoGrid>
      </section>

      

      <section className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mx-auto mb-6 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Our partners</h2>
          <p className="mt-2 text-muted-foreground">Trusted organizations supporting our entrepreneurs.</p>
        </div>
        <div className="grid grid-cols-2 items-center justify-items-center gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <PartnerLogo key={i} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mx-auto mb-6 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">What people say</h2>
          <p className="mt-2 text-muted-foreground">Founders, investors, and partners on their experience.</p>
        </div>
        <AnimatedTestimonials
          testimonials={[
            {
              name: "Alex Thompson",
              designation: "Founder @ TreeLife",
              src: "/Founder.jpg",
              quote: "The incubator helped us refine our product and meet the right partners.",
            },
            {
              name: "Samantha Ruiz",
              designation: "Investor",
              src: "/Photo.jpg",
              quote: "High quality deal flow and excellent visibility on project progress.",
            },
            {
              name: "Lina Park",
              designation: "Partner",
              src: "/LoginImage.png",
              quote: "Great collaboration and measurable impact across multiple initiatives.",
            },
          ]}
          autoplay
        />
      </section>
    </main>
  );
}

function StartupCard({ id, name, sector, description }: { id: number; name: string; sector?: string; description?: string }) {
  const username = `@${slugify(name)}`;
  const body = (description ?? "").slice(0, 120) || "Discover a promising startup from our ecosystem.";
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

function KpiCard({ value, label }: { value: string; label: string }) {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function PartnerLogo() {
  return (
    <div className="flex h-16 w-32 items-center justify-center rounded-md border border-border/60 bg-card p-3 grayscale hover:grayscale-0">
      <img src="/Logo.png" alt="Partner" className="max-h-full max-w-full object-contain opacity-80" />
    </div>
  );
}
