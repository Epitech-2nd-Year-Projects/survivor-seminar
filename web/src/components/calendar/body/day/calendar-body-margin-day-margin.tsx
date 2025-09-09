import { cn } from "@/lib/utils";

export const hours = Array.from({ length: 24 }, (_, i) => i);

export default function CalendarBodyMarginDayMargin({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("w-16 shrink-0", className)}>
      <div className="h-12" />
      {hours.map((hour) => (
        <div
          key={hour}
          className="border-border/50 text-muted-foreground flex h-32 items-start justify-end border-b pr-2 text-xs"
        >
          <span className="-translate-y-2">{hour}:00</span>
        </div>
      ))}
    </div>
  );
}
