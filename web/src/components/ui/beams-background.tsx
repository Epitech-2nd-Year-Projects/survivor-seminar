"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: "subtle" | "medium" | "strong";
  hue?: number;
}

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
  gradient?: CanvasGradient;
}

function createBeam(width: number, height: number, baseHue = 210): Beam {
  const angle = -35 + Math.random() * 10;
  const hueJitter = (Math.random() - 0.5) * 40;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 80 + Math.random() * 120,
    length: height * 3.2,
    angle,
    speed: 0.8 + Math.random() * 1.4,
    opacity: 0.18 + Math.random() * 0.18,
    hue: Math.max(0, Math.min(360, baseHue + hueJitter)),
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

export function BeamsBackground({
  className,
  intensity = "strong",
  children,
  hue,
}: AnimatedGradientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animationFrameRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);

  const BEAMS_BY_INTENSITY: Record<NonNullable<AnimatedGradientBackgroundProps["intensity"]>, number> = {
    subtle: 8,
    medium: 12,
    strong: 16,
  };

  const opacityMap = {
    subtle: 0.95,
    medium: 1.05,
    strong: 1.15,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = document.documentElement.classList.contains("dark");
    const alphaBoost = isDark ? 1 : 1.3;

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const updateCanvasSize = () => {
      const host = containerRef.current;
      const rect = host?.getBoundingClientRect();
      const vw = Math.max(1, Math.floor((rect?.width ?? window.innerWidth))); 
      const vh = Math.max(1, Math.floor((rect?.height ?? window.innerHeight)));

      const MAX_DPR = 1; // keep at 1 for performance; adjust if needed
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      const width = vw;
      const height = vh;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const rootStyle = getComputedStyle(document.documentElement);
      const primaryVar = rootStyle.getPropertyValue("--primary").trim();
      const colorWithAlpha = (a: number) => {
        const clamped = Math.max(0, Math.min(1, a));
        return primaryVar ? `oklch(${primaryVar} / ${clamped})` : `rgba(99,102,241,${clamped})`;
      };

      const desiredBeams = prefersReducedMotion ? 0 : BEAMS_BY_INTENSITY[intensity];
      beamsRef.current = Array.from({ length: desiredBeams }, (_, i) => {
        const b = createBeam(width, height, 0);
        const g = ctx.createLinearGradient(0, 0, 0, b.length);
        g.addColorStop(0, colorWithAlpha(0));
        g.addColorStop(0.1, colorWithAlpha(0.5));
        g.addColorStop(0.4, colorWithAlpha(1));
        g.addColorStop(0.6, colorWithAlpha(1));
        g.addColorStop(0.9, colorWithAlpha(0.5));
        g.addColorStop(1, colorWithAlpha(0));
        b.gradient = g;
        return b;
      });
    };

    updateCanvasSize();
    let ro: ResizeObserver | undefined;
    if ("ResizeObserver" in globalThis) {
      ro = new ResizeObserver(() => updateCanvasSize());
      if (containerRef.current) ro.observe(containerRef.current);
    } else {
      globalThis.addEventListener?.("resize", updateCanvasSize as EventListener);
    }

    function resetBeam(beam: Beam, index: number, totalBeams: number) {
      if (!canvas) return beam;

      const column = index % 3;
      const spacing = canvas.width / 3;

      beam.y = canvas.height + 100;
      beam.x =
        column * spacing +
        spacing / 2 +
        (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.opacity = 0.2 + Math.random() * 0.1;
      return beam;
    }

    function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity =
        beam.opacity * alphaBoost * (0.8 + Math.sin(beam.pulse) * 0.2) * opacityMap[intensity];

      if (beam.gradient) ctx.fillStyle = beam.gradient;
      ctx.globalAlpha = Math.max(0, Math.min(1, pulsingOpacity));
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    function animate(ts?: number) {
      if (!canvas || !ctx) return;
      if (document.visibilityState === "hidden") {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Limit to ~30fps for perf
      const now = ts ?? performance.now();
      const last = lastTsRef.current || 0;
      const delta = now - last;
      if (delta < 33) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTsRef.current = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = isDark ? "screen" : "multiply";

      const totalBeams = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;

        if (beam.y + beam.length < -100) {
          resetBeam(beam, index, totalBeams);
        }

        drawBeam(ctx, beam);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [intensity, hue]);

  return (
    <div ref={containerRef} className={cn("relative w-full h-full overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ filter: "blur(8px)" }}
      />

      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  );
}
