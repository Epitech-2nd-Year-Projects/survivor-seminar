"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type DropdownMenuProps = {
  options: {
    label: string;
    onClick: () => void;
    Icon?: React.ReactNode;
  }[];
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const DropdownMenu = ({
  options,
  children,
  open,
  onOpenChange,
}: DropdownMenuProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? Boolean(open) : uncontrolledOpen;

  // Force remount of the animated list on each open to reset animations
  const [mountId, setMountId] = useState(0);
  const prevOpen = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen && !prevOpen.current) {
      setMountId((i) => i + 1);
    }
    prevOpen.current = isOpen;
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        if (isControlled) onOpenChange?.(false);
        else setUncontrolledOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, isControlled, onOpenChange]);

  const toggleDropdown = () => {
    if (isControlled) onOpenChange?.(!isOpen);
    else setUncontrolledOpen(!isOpen);
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button
        onClick={toggleDropdown}
        className="border-input bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground rounded-xl border px-4 py-2 shadow-[0_0_20px_rgba(0,0,0,0.06)] backdrop-blur-sm"
      >
        {children ?? "Menu"}
        <>
          <motion.span
            className="ml-2"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut", type: "spring" }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={`dropdown-${mountId}`}
            initial={{ y: -5, scale: 0.95, filter: "blur(10px)" }}
            animate={{ y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ y: -5, scale: 0.95, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "circInOut", type: "spring" }}
            className="border-border bg-background/90 text-foreground absolute z-10 mt-2 w-56 rounded-xl border p-1 shadow-md backdrop-blur-sm"
          >
            <div className="flex max-h-80 flex-col gap-1 overflow-y-auto overscroll-contain pr-1">
              {options && options.length > 0 ? (
                options.map((option, index) => (
                  <motion.button
                    initial={{
                      opacity: 0,
                      x: 10,
                      scale: 0.95,
                      filter: "blur(10px)",
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      x: 10,
                      scale: 0.95,
                      filter: "blur(10px)",
                    }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: "easeInOut",
                      type: "spring",
                    }}
                    whileHover={{
                      backgroundColor: "hsl(var(--accent))",
                      transition: {
                        duration: 0.4,
                        ease: "easeInOut",
                      },
                    }}
                    whileTap={{
                      scale: 0.95,
                      transition: {
                        duration: 0.2,
                        ease: "easeInOut",
                      },
                    }}
                    key={option.label}
                    onClick={() => {
                      option.onClick();
                      if (isControlled) onOpenChange?.(false);
                      else setUncontrolledOpen(false);
                    }}
                    className="text-foreground hover:text-accent-foreground flex w-full cursor-pointer items-center gap-x-2 rounded-lg px-3 py-2 text-left text-sm"
                  >
                    {option.Icon}
                    {option.label}
                  </motion.button>
                ))
              ) : (
                <div className="text-foreground/60 px-4 py-2 text-xs">
                  No options
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { DropdownMenu };
