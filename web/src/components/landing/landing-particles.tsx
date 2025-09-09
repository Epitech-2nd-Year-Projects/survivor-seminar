"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Particles } from "@/components/ui/particle";

export function LandingParticles() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch; choose color after mount
  // Higher contrast for readability: bright in dark mode, darker in light mode
  const color = resolvedTheme === "dark" ? "#ffffff" : "#0f172a";

  return (
    <div className="absolute inset-0 -z-10">
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
