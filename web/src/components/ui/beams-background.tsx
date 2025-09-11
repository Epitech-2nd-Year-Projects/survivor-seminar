"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
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
  const MINIMUM_BEAMS = 20;

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
    const satPercent = isDark ? 85 : 70;
    const lightPercent = isDark ? 65 : 45;
    const alphaBoost = isDark ? 1 : 1.5;

    const updateCanvasSize = () => {
      const host = containerRef.current;
      const dpr = window.devicePixelRatio || 1;
      const docEl = document.documentElement;
      const body = document.body;
      const width = Math.max(
        host?.clientWidth ?? 0,
        docEl.scrollWidth,
        docEl.clientWidth,
        body.scrollWidth,
      );
      const height = Math.max(
        host?.clientHeight ?? 0,
        docEl.scrollHeight,
        docEl.clientHeight,
        body.scrollHeight,
      );
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      let baseHue = typeof hue === "number" ? hue : NaN;
      if (Number.isNaN(baseHue)) {
        const rootStyle = getComputedStyle(document.documentElement);
        const primary = rootStyle.getPropertyValue("--primary").trim();
        if (primary) {
          const [hStr = ""] = primary.split(/\s+/);
          const h = parseFloat(hStr);
          if (!Number.isNaN(h)) baseHue = h;
        }
      }
      if (Number.isNaN(baseHue)) baseHue = 300;

      const totalBeams = MINIMUM_BEAMS * 2;
      beamsRef.current = Array.from({ length: totalBeams }, () =>
        createBeam(canvas.width, canvas.height, baseHue)
      );
    };

    updateCanvasSize();
    let ro: ResizeObserver | undefined;
    if ("ResizeObserver" in globalThis) {
      ro = new ResizeObserver(() => updateCanvasSize());
      if (containerRef.current) ro.observe(containerRef.current);
      ro.observe(document.documentElement as Element);
      ro.observe(document.body as Element);
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
      beam.hue = 190 + (index * 70) / totalBeams;
      beam.opacity = 0.2 + Math.random() * 0.1;
      return beam;
    }

    function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity =
        beam.opacity * alphaBoost *
        (0.8 + Math.sin(beam.pulse) * 0.2) *
        opacityMap[intensity];

      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

      gradient.addColorStop(0, `hsla(${beam.hue}, ${satPercent}%, ${lightPercent}%, 0)`);
      gradient.addColorStop(
        0.1,
        `hsla(${beam.hue}, ${satPercent}%, ${lightPercent}%, ${pulsingOpacity * 0.5})`
      );
      gradient.addColorStop(
        0.4,
        `hsla(${beam.hue}, ${satPercent}%, ${lightPercent}%, ${pulsingOpacity})`
      );
      gradient.addColorStop(
        0.6,
        `hsla(${beam.hue}, ${satPercent}%, ${lightPercent}%, ${pulsingOpacity})`
      );
      gradient.addColorStop(
        0.9,
        `hsla(${beam.hue}, ${satPercent}%, ${lightPercent}%, ${pulsingOpacity * 0.5})`
      );
      gradient.addColorStop(1, `hsla(${beam.hue}, ${satPercent}%, ${lightPercent}%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    function animate() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "blur(24px)";
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
  }, [intensity]);

  return (
    <div ref={containerRef} className={cn("relative w-full h-full overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ filter: "blur(15px)" }}
      />

      <motion.div className="absolute inset-0" style={{ backdropFilter: "blur(35px)" }} />

      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  );
}
