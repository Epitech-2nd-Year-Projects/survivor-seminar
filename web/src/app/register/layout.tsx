import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

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

export default function LoginPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RegisterClient />
    </Suspense>
  );
}
