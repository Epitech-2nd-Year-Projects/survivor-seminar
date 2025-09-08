import { cn } from "@/lib/utils"

export const hours = Array.from({ length: 24 }, (_, i) => i)

export default function CalendarBodyMarginDayMargin({ className }: { className?: string }) {
  return (
    <div className={cn("w-16 shrink-0", className)}>
      <div className="h-12" />
      {hours.map((hour) => (
        <div key={hour} className="h-32 border-b border-border/50 text-xs text-muted-foreground pr-2 flex items-start justify-end">
          <span className="-translate-y-2">{hour}:00</span>
        </div>
      ))}
    </div>
  )
}

