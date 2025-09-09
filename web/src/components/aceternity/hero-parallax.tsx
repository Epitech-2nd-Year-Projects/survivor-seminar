"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

export type ParallaxItem = {
  title: string;
  href?: string;
  thumbnail: string;
};

type HeroParallaxProps = {
  items: ParallaxItem[];
  className?: string;
};

// Lightweight Hero Parallax inspired by Aceternity UI
export function HeroParallax({ items, className }: HeroParallaxProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-150, 150], [8, -8]), { stiffness: 120, damping: 20 });
  const ry = useSpring(useTransform(x, [-150, 150], [-8, 8]), { stiffness: 120, damping: 20 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(-150, Math.min(150, dx)));
    y.set(Math.max(-150, Math.min(150, dy)));
  };

  const layers = chunk(items, 7);

  return (
    <section
      ref={ref}
      onMouseMove={onMouseMove}
      className={[
        "relative mx-auto w-full overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-b from-background to-background/60",
        "shadow-lg supports-[backdrop-filter]:backdrop-blur-xl",
        className ?? "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,hsl(var(--primary)/0.08)_0%,transparent_70%)]" />

      <div className="relative z-10 px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Accélérez vos projets avec une expérience moderne
          </h1>
          <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
            Animations fluides, composants élégants et performance. Découvrez une hero section parallax inspirée d’Aceternity UI.
          </p>
        </div>
      </div>

      <div className="relative z-10 -mt-6 grid gap-6 px-6 pb-16 sm:px-10 sm:pb-24">
        {layers.map((layer, i) => (
          <ParallaxRow key={i} items={layer} rx={rx} ry={ry} offset={i} />
        ))}
      </div>
    </section>
  );
}

function ParallaxRow({
  items,
  rx,
  ry,
  offset,
}: {
  items: ParallaxItem[];
  rx: any;
  ry: any;
  offset: number;
}) {
  const translateX = useSpring(useTransform(ry, [-8, 8], [-20 - offset * 8, 20 + offset * 8]), {
    stiffness: 120,
    damping: 22,
  });

  return (
    <motion.div
      style={{ rotateX: rx, rotateY: ry, x: translateX }}
      className="mx-auto flex w-full max-w-6xl flex-row items-center justify-center gap-4"
    >
      {items.map((item, idx) => (
        <Card key={idx} item={item} />
      ))}
    </motion.div>
  );
}

function Card({ item }: { item: ParallaxItem }) {
  const content = (
    <div className="group relative aspect-[4/3] w-40 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm sm:w-56">
      <Image
        src={item.thumbnail}
        alt={item.title}
        fill
        sizes="(max-width: 640px) 160px, 224px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
      <div className="absolute inset-x-0 bottom-0 p-2 text-xs text-white/90 sm:p-3 sm:text-sm">
        <div className="line-clamp-2 font-medium drop-shadow">{item.title}</div>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} target="_blank" rel="noreferrer" className="focus:outline-none">
        {content}
      </Link>
    );
  }
  return content;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

