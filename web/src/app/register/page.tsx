import { Component as SignUpCard } from "@/components/ui/sign-up-card-2";
import { GridBeams } from "@/components/magicui/grid-beams";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";

export default function RegisterPage() {
  return (
    <GridBeams
      className="relative flex min-h-screen w-full items-center justify-center"
      backgroundColor="var(--background)"
      gridColor="color-mix(in oklch, var(--foreground) 28%, transparent)"
    >
      <div className="absolute right-4 top-4 z-20">
        <AnimatedThemeToggler className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-background/60 ring-1 ring-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/40" />
      </div>
      <SignUpCard />
    </GridBeams>
  );
}
