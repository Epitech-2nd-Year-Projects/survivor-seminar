"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeClosed,
  ArrowRight,
  User,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRegister } from "@/lib/api/services/auth/hooks";
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<
    null | "email" | "password" | "name" | "confirm"
  >(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

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
  const next = sp.get("next") ?? "/login";

  const { mutateAsync, isPending } = useRegister();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!passwordsMatch) return;
    setErrorMsg(null);
    try {
      await mutateAsync({ email, password, name, role: "investor" });
      router.replace(next);
      router.refresh();
    } catch (err) {
      setErrorMsg(userMessageFromError(err));
    }
  }

  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
      { regex: /[!@#$%^&*(),.?":{}|<>]/, text: "At least 1 special character" },
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const strength = checkStrength(password);
  const strengthScore = strength.filter((req) => req.met).length;
  const strengthWidth = `${(strengthScore / 5) * 100}%`;
  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-foreground/10";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score === 3) return "bg-amber-500";
    if (score === 4) return "bg-yellow-500";
    return "bg-emerald-500";
  };
  const getStrengthText = (score: number) => {
    if (score === 0) return "Enter a password";
    if (score <= 2) return "Weak password";
    if (score <= 3) return "Medium password";
    if (score === 4) return "Strong password";
    return "Very strong password";
  };

  const passwordsMatch =
    confirmPassword.length === 0 ? true : password === confirmPassword;

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
            <div className="absolute -inset-[1px] overflow-hidden rounded-2xl">
              <motion.div
                className="via-primary absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent to-transparent opacity-70"
                animate={{ left: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3] }}
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
              <motion.div
                className="via-primary absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent to-transparent opacity-70"
                animate={{ top: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3] }}
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
              <motion.div
                className="via-primary absolute right-0 bottom-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent to-transparent opacity-70"
                animate={{ right: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3] }}
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
              <motion.div
                className="via-primary absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent to-transparent opacity-70"
                animate={{ bottom: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3] }}
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
            </div>
            <div className="from-primary/10 via-primary/5 to-primary/10 absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-70" />
            <div className="ring-border/40 bg-background/20 supports-[backdrop-filter]:bg-background/10 relative overflow-hidden rounded-2xl p-6 shadow-2xl ring-1 backdrop-blur-md">
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `linear-gradient(135deg, color-mix(in oklch, var(--foreground) 45%, transparent) 0.5px, transparent 0.5px), linear-gradient(45deg, color-mix(in oklch, var(--foreground) 45%, transparent) 0.5px, transparent 0.5px)`,
                  backgroundSize: "30px 30px",
                }}
              />

              <div className="mb-5 space-y-1 text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="border-border/60 relative mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border"
                >
                  <span className="from-foreground to-foreground/70 bg-gradient-to-b bg-clip-text text-lg font-bold text-transparent">
                    S
                  </span>
                  <div className="from-primary/15 absolute inset-0 bg-gradient-to-br to-transparent opacity-60" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="from-foreground to-foreground/80 bg-gradient-to-b bg-clip-text text-xl font-bold text-transparent"
                >
                  Create Account
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-foreground/60 text-xs"
                >
                  Sign up to get started
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <p className="text-center text-sm text-red-400">{errorMsg}</p>
                )}
                <motion.div className="space-y-3">
                  <motion.div
                    className={`relative ${focusedInput === "name" ? "z-10" : ""}`}
                    whileFocus={{ scale: 1.02 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <User
                        className={`absolute left-3 h-4 w-4 transition-all duration-300 ${
                          focusedInput === "name"
                            ? "text-foreground"
                            : "text-foreground/40"
                        }`}
                      />
                      <Input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocusedInput("name")}
                        onBlur={() => setFocusedInput(null)}
                        className="bg-foreground/5 focus:border-foreground/20 text-foreground placeholder:text-foreground/40 focus:bg-foreground/10 h-10 w-full border-transparent pr-3 pl-10 transition-all duration-300"
                      />
                      {focusedInput === "name" && (
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

                  <motion.div
                    className={`relative ${focusedInput === "password" ? "z-10" : ""}`}
                    whileFocus={{ scale: 1.02 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
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

                  <div className="mt-2">
                    <div
                      className="bg-foreground/10 mb-3 h-1 w-full overflow-hidden rounded-full"
                      role="progressbar"
                      aria-valuenow={strengthScore}
                      aria-valuemin={0}
                      aria-valuemax={5}
                      aria-label="Password strength"
                    >
                      <div
                        className={cn(
                          "h-full transition-all duration-500 ease-out",
                          getStrengthColor(strengthScore),
                        )}
                        style={{ width: strengthWidth }}
                      />
                    </div>
                    <p className="text-foreground/80 mb-2 text-[11px] font-medium">
                      {getStrengthText(strengthScore)}.
                    </p>
                    <ul
                      className="space-y-1.5"
                      aria-label="Password requirements"
                    >
                      {strength.map((req, index) => (
                        <li key={index} className="flex items-center gap-2">
                          {req.met ? (
                            <Check
                              className="h-3.5 w-3.5 text-emerald-400"
                              aria-hidden="true"
                            />
                          ) : (
                            <X
                              className="text-foreground/50 h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          )}
                          <span
                            className={cn(
                              "text-[11px]",
                              req.met
                                ? "text-emerald-400/90"
                                : "text-foreground/60",
                            )}
                          >
                            {req.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <motion.div
                    className={`relative ${focusedInput === "confirm" ? "z-10" : ""}`}
                    whileFocus={{ scale: 1.02 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="from-primary/20 via-primary/10 to-primary/20 absolute -inset-[0.5px] rounded-lg bg-gradient-to-r opacity-0 transition-all duration-300 group-hover:opacity-100" />
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Lock
                        className={`absolute left-3 h-4 w-4 transition-all duration-300 ${
                          focusedInput === "confirm"
                            ? "text-foreground"
                            : "text-foreground/40"
                        }`}
                      />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocusedInput("confirm")}
                        onBlur={() => setFocusedInput(null)}
                        aria-invalid={!passwordsMatch}
                        className="bg-foreground/5 focus:border-foreground/20 text-foreground placeholder:text-foreground/40 focus:bg-foreground/10 h-10 w-full border-transparent pr-10 pl-10 transition-all duration-300"
                      />
                      <div
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <Eye className="text-foreground/40 hover:text-foreground h-4 w-4 transition-colors duration-300" />
                        ) : (
                          <EyeClosed className="text-foreground/40 hover:text-foreground h-4 w-4 transition-colors duration-300" />
                        )}
                      </div>
                      {focusedInput === "confirm" && (
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
                    {!passwordsMatch && (
                      <p className="mt-1.5 text-[11px] text-red-400">
                        Passwords do not match
                      </p>
                    )}
                  </motion.div>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isPending || !passwordsMatch}
                  className="group/button relative mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="bg-primary text-primary-foreground relative flex h-10 items-center justify-center overflow-hidden rounded-lg font-medium transition-all duration-300">
                    <motion.div
                      className="from-primary/0 via-primary-foreground/30 to-primary/0 absolute inset-0 -z-10 bg-gradient-to-r"
                      animate={{ x: ["-100%", "100%"] }}
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
                          Sign Up
                          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/button:translate-x-1" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                <div className="relative mt-2 mb-5 flex items-center">
                  <div className="border-border/40 flex-grow border-t"></div>
                  <span className="text-foreground/40 mx-3 text-xs">or</span>
                  <div className="border-border/40 flex-grow border-t"></div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="group/google relative w-full"
                >
                  <div className="bg-foreground/5 text-foreground border-border/60 hover:border-border relative flex h-10 items-center justify-center gap-2 overflow-hidden rounded-lg border font-medium transition-all duration-300">
                    <div className="text-foreground/80 group-hover/google:text-foreground flex h-4 w-4 items-center justify-center transition-colors duration-300">
                      G
                    </div>
                    <span className="text-foreground/80 group-hover/google:text-foreground text-xs transition-colors">
                      Sign up with Google
                    </span>
                    <motion.div
                      className="from-foreground/0 via-foreground/10 to-foreground/0 absolute inset-0 bg-gradient-to-r"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />
                  </div>
                </motion.button>

                <motion.p
                  className="text-foreground/60 mt-4 text-center text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="group/signin relative inline-block"
                  >
                    <span className="text-foreground group-hover/signin:text-foreground/70 relative z-10 font-medium transition-colors duration-300">
                      Sign in
                    </span>
                    <span className="bg-foreground absolute bottom-0 left-0 h-[1px] w-0 transition-all duration-300 group-hover/signin:w-full" />
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
