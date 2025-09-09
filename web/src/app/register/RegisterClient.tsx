"use client";
import { Component as SignUpCard } from "@/components/ui/sign-up-card";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";

export default function RegisterClient() {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="relative flex flex-col items-center justify-center gap-4"
      >
        <div className="absolute top-4 right-4 z-20">
          <AnimatedThemeToggler className="bg-background/60 ring-border/60 supports-[backdrop-filter]:bg-background/40 text-primary inline-flex h-9 w-9 items-center justify-center rounded-md ring-1 backdrop-blur" />
        </div>
        <SignUpCard />
      </motion.div>
    </AuroraBackground>
  );
}
