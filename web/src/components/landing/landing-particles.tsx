"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Particles } from "@/components/ui/particle";

export function LandingParticles() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const color = useMemo(() => {
    if (!mounted) return undefined;
    const root = document.documentElement;
    const v = getComputedStyle(root).getPropertyValue("--primary").trim();
    return v || (resolvedTheme === "dark" ? "#ffffff" : "#0f172a");
  }, [mounted, resolvedTheme]);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {mounted ? (
        <Particles
          className="absolute inset-0"
          quantity={320}
          size={1.2}
          color={color}
          staticity={60}
          ease={60}
        />
      ) : null}
    </div>
  );
}
