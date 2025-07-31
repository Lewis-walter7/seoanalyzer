import * as React from "react"
import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SeoBadge, type SeoStatus } from "@/components/ui/seo-badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface SeoMetric {
  label: string
  value: string | number
  status: SeoStatus
}

interface AuditResult {
  id: string
  url: string
  performanceScore: number
  seoMetrics: SeoMetric[]
  crawledAt: string
}

interface AuditResultCardProps {
  result: AuditResult
  className?: string
}

const AuditResultCard = React.forwardRef<HTMLDivElement, AuditResultCardProps>(
  ({ result, className }, ref) => {
    const { url, performanceScore, seoMetrics } = result

    // Get performance score color and label
    const getPerformanceStatus = (score: number): { status: SeoStatus; label: string } => {
      if (score >= 90) return { status: "good", label: "Excellent" }
      if (score >= 70) return { status: "warning", label: "Good" }
      if (score >= 50) return { status: "warning", label: "Needs Improvement" }
      return { status: "issue", label: "Poor" }
    }

    const performanceStatus = getPerformanceStatus(performanceScore)

    return (
      <Card ref={ref} className={cn("h-full", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Link 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary transition-colors truncate flex-1"
            >
              <span className="truncate">{url}</span>
              <ExternalLinkIcon className="h-4 w-4 shrink-0" />
            </Link>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Performance Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Performance Score</span>
              <SeoBadge 
                status={performanceStatus.status} 
                value={`${performanceScore}%`}
              />
            </div>
            <Progress value={performanceScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {performanceStatus.label}
            </p>
          </div>

          {/* SEO Metrics Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">SEO Metrics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {seoMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <span className="text-xs font-medium truncate pr-2">
                    {metric.label}
                  </span>
                  <SeoBadge 
                    status={metric.status}
                    value={metric.value}
                    className="text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
AuditResultCard.displayName = "AuditResultCard"

export { AuditResultCard, type AuditResult, type SeoMetric }
