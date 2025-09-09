"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Mail, Lock, Eye, EyeClosed, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useLogin } from "@/lib/api/services/auth/hooks";
import { userMessageFromError } from "@/lib/api/http/messages";
import { useRouter, useSearchParams } from "next/navigation";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export function Component() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<null | "email" | "password">(
    null,
  );
  const [rememberMe, setRememberMe] = useState(false);

  // For 3D card effect - increased rotation range for more pronounced 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]); // Increased from 5/-5 to 10/-10
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]); // Increased from -5/5 to -10/10

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/";

  const { mutateAsync, isPending } = useLogin();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await mutateAsync({ email, password });
      router.replace(next);
      router.refresh();
    } catch (err) {
      setErrorMsg(userMessageFromError(err));
    }
  }

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-sm"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative">
            {/* Traveling light beam effect - reduced opacity */}
            <div className="absolute -inset-[1px] overflow-hidden rounded-2xl">
              {/* Top light beam - enhanced glow (theme primary) */}
              <motion.div
                className="via-primary absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent to-transparent opacity-70"
                animate={{
                  left: ["-50%", "100%"],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  left: {
                    duration: 2.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 1,
                  },
                  opacity: {
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "mirror",
                  },
                }}
              />

              {/* Right light beam - enhanced glow (theme primary) */}
              <motion.div
                className="via-primary absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent to-transparent opacity-70"
                animate={{
                  top: ["-50%", "100%"],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  top: {
                    duration: 2.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 1,
                    delay: 0.6,
                  },
                  opacity: {
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 0.6,
                  },
                }}
              />

              {/* Bottom light beam - enhanced glow (theme primary) */}
              <motion.div
                className="via-primary absolute right-0 bottom-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent to-transparent opacity-70"
                animate={{
                  right: ["-50%", "100%"],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  right: {
                    duration: 2.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 1,
                    delay: 1.2,
                  },
                  opacity: {
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 1.2,
                  },
                }}
              />

              {/* Left light beam - enhanced glow (theme primary) */}
              <motion.div
                className="via-primary absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent to-transparent opacity-70"
                animate={{
                  bottom: ["-50%", "100%"],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  bottom: {
                    duration: 2.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 1,
                    delay: 1.8,
                  },
                  opacity: {
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 1.8,
                  },
                }}
              />

              {/* Subtle corner glow spots - use theme primary */}
              <motion.div
                className="bg-primary/40 absolute top-0 left-0 h-[5px] w-[5px] rounded-full"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
              />
              <motion.div
                className="bg-primary/60 absolute top-0 right-0 h-[8px] w-[8px] rounded-full"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 0.5,
                }}
              />
              <motion.div
                className="bg-primary/60 absolute right-0 bottom-0 h-[8px] w-[8px] rounded-full"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 1,
                }}
              />
              <motion.div
                className="bg-primary/40 absolute bottom-0 left-0 h-[5px] w-[5px] rounded-full"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 2.3,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 1.5,
                }}
              />
            </div>

            {/* Glass card background (theme-aware) */}
            <div className="ring-border/40 bg-background/20 supports-[backdrop-filter]:bg-background/10 relative overflow-hidden rounded-2xl p-6 shadow-2xl ring-1 backdrop-blur-md">
              {/* Subtle card inner patterns */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    `linear-gradient(135deg, color-mix(in oklch, var(--foreground) 45%, transparent) 0.5px, transparent 0.5px), ` +
                    `linear-gradient(45deg, color-mix(in oklch, var(--foreground) 45%, transparent) 0.5px, transparent 0.5px)`,
                  backgroundSize: "30px 30px",
                }}
              />

              {/* Logo and header */}
              <div className="mb-5 space-y-1 text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="border-border/60 relative mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border"
                >
                  {/* Logo placeholder - would be an SVG in practice */}
                  {/* <!-- SVG_LOGO --> */}
                  <span className="from-foreground to-foreground/70 bg-gradient-to-b bg-clip-text text-lg font-bold text-transparent">
                    S
                  </span>

                  {/* Inner lighting effect */}
                  <div className="from-primary/15 absolute inset-0 bg-gradient-to-br to-transparent opacity-60" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="from-foreground to-foreground/80 bg-gradient-to-b bg-clip-text text-xl font-bold text-transparent"
                >
                  Welcome Back
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-foreground/60 text-xs"
                >
                  Sign in to continue to StyleMe
                </motion.p>
              </div>

              {/* Login form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <p className="text-center text-sm text-red-400">{errorMsg}</p>
                )}
                <motion.div className="space-y-3">
                  {/* Email input */}
                  <motion.div
                    className={`relative ${focusedInput === "email" ? "z-10" : ""}`}
                    whileFocus={{ scale: 1.02 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Mail
                        className={`absolute left-3 h-4 w-4 transition-all duration-300 ${
                          focusedInput === "email"
                            ? "text-foreground"
                            : "text-foreground/40"
                        }`}
                      />

                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput("email")}
                        onBlur={() => setFocusedInput(null)}
                        className="bg-foreground/5 focus:border-foreground/20 text-foreground placeholder:text-foreground/40 focus:bg-foreground/10 h-10 w-full border-transparent pr-3 pl-10 transition-all duration-300"
                      />

                      {/* Input highlight effect */}
                      {focusedInput === "email" && (
                        <motion.div
                          layoutId="input-highlight"
                          className="bg-foreground/5 absolute inset-0 -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Password input */}
                  <motion.div
                    className={`relative ${focusedInput === "password" ? "z-10" : ""}`}
                    whileFocus={{ scale: 1.02 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="from-primary/20 via-primary/10 to-primary/20 absolute -inset-[0.5px] rounded-lg bg-gradient-to-r opacity-0 transition-all duration-300 group-hover:opacity-100" />

                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Lock
                        className={`absolute left-3 h-4 w-4 transition-all duration-300 ${
                          focusedInput === "password"
                            ? "text-foreground"
                            : "text-foreground/40"
                        }`}
                      />

                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput("password")}
                        onBlur={() => setFocusedInput(null)}
                        className="bg-foreground/5 focus:border-foreground/20 text-foreground placeholder:text-foreground/40 focus:bg-foreground/10 h-10 w-full border-transparent pr-10 pl-10 transition-all duration-300"
                      />

                      {/* Toggle password visibility */}
                      <div
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 cursor-pointer"
                      >
                        {showPassword ? (
                          <Eye className="text-foreground/40 hover:text-foreground h-4 w-4 transition-colors duration-300" />
                        ) : (
                          <EyeClosed className="text-foreground/40 hover:text-foreground h-4 w-4 transition-colors duration-300" />
                        )}
                      </div>

                      {/* Input highlight effect */}
                      {focusedInput === "password" && (
                        <motion.div
                          layoutId="input-highlight"
                          className="bg-foreground/5 absolute inset-0 -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>
                </motion.div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="border-foreground/20 bg-foreground/5 checked:bg-primary checked:border-primary focus:ring-primary/30 h-4 w-4 appearance-none rounded border transition-all duration-200 focus:ring-1 focus:outline-none"
                      />
                      {rememberMe && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-primary-foreground pointer-events-none absolute inset-0 flex items-center justify-center"
                        >
                          {/* <!-- SVG_CHECKMARK --> */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    <label
                      htmlFor="remember-me"
                      className="text-foreground/60 hover:text-foreground text-xs transition-colors duration-200"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="group/link relative text-xs">
                    <Link
                      href="/forgot-password"
                      className="text-foreground/60 hover:text-foreground transition-colors duration-200"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Sign in button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isPending}
                  className="group/button relative mt-5 w-full"
                >
                  <div className="bg-primary text-primary-foreground relative flex h-10 items-center justify-center overflow-hidden rounded-lg font-medium transition-all duration-300">
                    {/* Button background animation */}
                    <motion.div
                      className="from-primary/0 via-primary-foreground/30 to-primary/0 absolute inset-0 -z-10 bg-gradient-to-r"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                      style={{
                        opacity: isPending ? 1 : 0,
                        transition: "opacity 0.3s ease",
                      }}
                    />

                    <AnimatePresence mode="wait">
                      {isPending ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          <div className="border-primary-foreground/70 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="button-text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-1 text-sm font-medium"
                        >
                          Sign In
                          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/button:translate-x-1" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                {/* Minimal Divider */}
                <div className="relative mt-2 mb-5 flex items-center">
                  <div className="border-border/40 flex-grow border-t"></div>
                  <motion.span
                    className="text-foreground/40 mx-3 text-xs"
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: [0.7, 0.9, 0.7] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    or
                  </motion.span>
                  <div className="border-border/40 flex-grow border-t"></div>
                </div>

                {/* Google Sign In */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="group/google relative w-full"
                >
                  <div className="bg-foreground/5 text-foreground border-border/60 hover:border-border relative flex h-10 items-center justify-center gap-2 overflow-hidden rounded-lg border font-medium transition-all duration-300">
                    {/* <!-- SVG_GOOGLE_LOGO --> */}
                    <div className="text-foreground/80 group-hover/google:text-foreground flex h-4 w-4 items-center justify-center transition-colors duration-300">
                      G
                    </div>

                    <span className="text-foreground/80 group-hover/google:text-foreground text-xs transition-colors">
                      Sign in with Google
                    </span>

                    {/* Button hover effect */}
                    <motion.div
                      className="from-foreground/0 via-foreground/10 to-foreground/0 absolute inset-0 bg-gradient-to-r"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{
                        duration: 1,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </motion.button>

                {/* Sign up link */}
                <motion.p
                  className="text-foreground/60 mt-4 text-center text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="group/signup relative inline-block"
                  >
                    <span className="text-foreground group-hover/signup:text-foreground/70 relative z-10 font-medium transition-colors duration-300">
                      Sign up
                    </span>
                    <span className="bg-foreground absolute bottom-0 left-0 h-[1px] w-0 transition-all duration-300 group-hover/signup:w-full" />
                  </Link>
                </motion.p>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
