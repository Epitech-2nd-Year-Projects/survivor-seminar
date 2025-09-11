"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, TrendingUp, Video, Globe, Mail, Phone } from "lucide-react";
import Link from "next/link";

export interface BentoItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  status?: string;
  tags?: string[];
  meta?: string;
  cta?: string;
  colSpan?: number;
  hasPersistentHover?: boolean;
  href?: string;
  hasWebsite?: boolean;
  hasEmail?: boolean;
  hasPhone?: boolean;
}

interface BentoGridProps {
  items: BentoItem[];
  className?: string;
}

const itemsSample: BentoItem[] = [
  {
    title: "Analytics Dashboard",
    meta: "v2.4.1",
    description:
      "Real-time metrics with AI-powered insights and predictive analytics",
    icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
    status: "Live",
    tags: ["Statistics", "Reports", "AI"],
    colSpan: 2,
    hasPersistentHover: true,
  },
  {
    title: "Task Manager",
    meta: "84 completed",
    description: "Automated workflow management with priority scheduling",
    icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    status: "Updated",
    tags: ["Productivity", "Automation"],
  },
  {
    title: "Media Library",
    meta: "12GB used",
    description: "Cloud storage with intelligent content processing",
    icon: <Video className="w-4 h-4 text-purple-500" />,
    tags: ["Storage", "CDN"],
    colSpan: 2,
  },
  {
    title: "Global Network",
    meta: "6 regions",
    description: "Multi-region deployment with edge computing",
    icon: <Globe className="w-4 h-4 text-sky-500" />,
    status: "Beta",
    tags: ["Infrastructure", "Edge"],
  },
];

function BentoGrid({ items = itemsSample, className }: BentoGridProps) {
  return (
    <div className={cn("grid w-full grid-cols-1 gap-6 md:grid-cols-3", className)}>
      {items.map((item, index) => {
        const cardClasses = cn(
          "group relative overflow-hidden rounded-xl p-4 transition-all duration-300",
          "border border-border bg-card/50 backdrop-blur-sm text-card-foreground",
          "hover:shadow-md hover:-translate-y-0.5 will-change-transform",
          item.colSpan ?? "col-span-1",
          item.colSpan === 2 ? "md:col-span-2" : "",
          { "shadow-md -translate-y-0.5": item.hasPersistentHover },
        );

        const inner = (
          <>
            <div
              className={`absolute inset-0 ${
                item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } transition-opacity duration-300`}
            >
              <div className="absolute inset-0 bg-accent/10" />
            </div>

            <div className="relative flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                {/* Top-left: contact capability icons (website/mail/phone) */}
                <div className="flex items-center gap-2">
                  <Globe
                    className={cn(
                      "h-4 w-4",
                      item.hasWebsite ? "text-primary" : "text-muted-foreground/40",
                    )}
                  />
                  <Mail
                    className={cn(
                      "h-4 w-4",
                      item.hasEmail ? "text-primary" : "text-muted-foreground/40",
                    )}
                  />
                  <Phone
                    className={cn(
                      "h-4 w-4",
                      item.hasPhone ? "text-primary" : "text-muted-foreground/40",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "rounded-lg px-2 py-1 text-xs font-medium backdrop-blur-sm",
                    "bg-muted/20 text-muted-foreground",
                    "transition-colors duration-300 group-hover:bg-muted/30",
                  )}
                >
                  {item.status ?? "Active"}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-[15px] font-medium tracking-tight text-foreground">
                  {item.title}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {item.meta}
                  </span>
                </h3>
                <p className="text-sm font-[425] leading-snug text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {item.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-muted/20 px-2 py-1 backdrop-blur-sm transition-all duration-200 hover:bg-muted/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                {/* Bottom-right: hover Explore CTA */}
                <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {item.cta ?? "Explore →"}
                </span>
              </div>
            </div>

            <div
              className={`absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-border to-transparent ${
                item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } transition-opacity duration-300`}
            />
          </>
        );

        return item.href ? (
          <Link key={index} href={item.href} className={cardClasses}>
            {inner}
          </Link>
        ) : (
          <div key={index} className={cardClasses}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export { BentoGrid }
