import { Suspense } from "react";
import { BeamsBackground } from "@/components/ui/beams-background";
import StartupsClient from "./StartupsClient";
import { BentoGrid } from "@/components/ui/bento-grid";

function PageSkeleton() {
  return (
    <BentoGrid
      items={Array.from({ length: 12 }).map(() => ({
        title: "Loading…",
        meta: "",
        description: "Fetching startups data…",
        icon: null,
        status: "",
        tags: [],
      }))}
    />
  );
}

export default function StartupsPage() {
  return (
    <div className="relative">
      <BeamsBackground
        intensity="medium"
        hue={300}
        className="pointer-events-none fixed inset-0 -z-10 w-full h-full"
      />
      <Suspense fallback={<PageSkeleton />}>
        <StartupsClient />
      </Suspense>
    </div>
  );
}
