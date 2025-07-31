import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"

type SeoStatus = "good" | "warning" | "issue" | "info"

interface SeoBadgeProps extends React.ComponentProps<typeof Badge> {
  status: SeoStatus
  value?: string | number
  label?: string
}

const getStatusVariant = (status: SeoStatus) => {
  switch (status) {
    case "good":
      return "default" // Will be styled green
    case "warning": 
      return "secondary" // Will be styled yellow
    case "issue":
      return "destructive" // Red
    case "info":
      return "outline" // Neutral
    default:
      return "outline"
  }
}

const getStatusColor = (status: SeoStatus) => {
  switch (status) {
    case "good":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
    case "warning":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
    case "issue":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
    case "info":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
    default:
      return ""
  }
}

const SeoBadge = React.forwardRef<HTMLSpanElement, SeoBadgeProps>(
  ({ className, status, value, label, children, ...props }, ref) => {
    const content = children || (
      <>
        {label && <span className="font-medium">{label}:</span>}
        {value && <span>{value}</span>}
      </>
    )

    // Generate meaningful aria-label if not provided
    const ariaLabel = props['aria-label'] || 
      (label && value ? `${label}: ${value}` : 
       (children ? children.toString() : 'SEO status badge'))

    return (
      <Badge
        ref={ref}
        className={cn(
          getStatusColor(status),
          "font-medium min-h-[32px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
          className
        )}
        aria-label={ariaLabel}
        role="status"
        tabIndex={0}
        {...props}
      >
        {content}
      </Badge>
    )
  }
)
SeoBadge.displayName = "SeoBadge"

export { SeoBadge, type SeoStatus }
