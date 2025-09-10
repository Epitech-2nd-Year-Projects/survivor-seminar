"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { GridBeams } from "@/components/magicui/grid-beams";

type Props = React.ComponentProps<typeof GridBeams>;

export function LandingGridBeams(props: Omit<Props, "backgroundColor" | "gridColor">) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const backgroundColor = isDark ? "#020412" : "#ffffff";
  const gridColor = isDark ? "rgba(200,220,255,0.2)" : "rgba(15,23,42,0.12)"; // slate-900 at 12%

  if (!mounted) return null;
  return <GridBeams {...props} backgroundColor={backgroundColor} gridColor={gridColor} />;
}

