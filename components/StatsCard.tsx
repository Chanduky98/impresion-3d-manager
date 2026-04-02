import { ReactNode } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    direction: "up" | "down"
  }
  className?: string
  valueClassName?: string
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  className,
  valueClassName,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className={cn("text-2xl font-bold mt-2", valueClassName)}>{value}</p>

          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 mt-2 text-sm",
                trend.direction === "up" ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <div className="ml-4 p-3 bg-primary/10 rounded-lg text-primary">{icon}</div>
      </div>
    </div>
  )
}
