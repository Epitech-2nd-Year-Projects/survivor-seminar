import { Suspense } from "react";
import { BeamsBackground } from "@/components/ui/beams-background";
import NewsClient from "./NewsClient";

function PageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="rounded border p-4">
          <div className="bg-muted mb-2 h-5 w-3/4 animate-pulse" />
          <div className="bg-muted h-4 w-1/2 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function NewsPage() {
  return (
    <div className="relative">
      <BeamsBackground
        intensity="medium"
        hue={300}
        className="pointer-events-none fixed inset-0 -z-10 w-full h-full"
      />
      <Suspense fallback={<PageSkeleton />}>
        <NewsClient />
      </Suspense>
    </div>
  );
}
