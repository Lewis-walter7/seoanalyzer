"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeftIcon, CalendarIcon, GlobeIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { AuditResultCard, type AuditResult } from "./AuditResultCard"
import { FilterSort, type SortOption, type FilterOption } from "./FilterSort"
import { cn } from "@/lib/utils"

interface ProjectInfo {
  id: string
  name: string
  latestCrawlDate: string
  totalPages: number
}

interface AuditResultsLayoutProps {
  project: ProjectInfo
  results: AuditResult[]
  isLoading?: boolean
  className?: string
}

const AuditResultsLayout = React.forwardRef<HTMLDivElement, AuditResultsLayoutProps>(
  ({ project, results, isLoading = false, className }, ref) => {
    const [sortBy, setSortBy] = React.useState<SortOption>("crawled-desc")
    const [filterBy, setFilterBy] = React.useState<FilterOption>("all")

    // Filter and sort results
    const filteredAndSortedResults = React.useMemo(() => {
      let filtered = results

      // Apply filter
      if (filterBy !== "all") {
        filtered = results.filter(result => {
          const avgScore = result.performanceScore
          switch (filterBy) {
            case "good":
              return avgScore >= 70
            case "warning":
              return avgScore >= 50 && avgScore < 70
            case "issue":
              return avgScore < 50
            default:
              return true
          }
        })
      }

      // Apply sort
      return filtered.sort((a, b) => {
        switch (sortBy) {
          case "url-asc":
            return a.url.localeCompare(b.url)
          case "url-desc":
            return b.url.localeCompare(a.url)
          case "performance-asc":
            return a.performanceScore - b.performanceScore
          case "performance-desc":
            return b.performanceScore - a.performanceScore
          case "crawled-asc":
            return new Date(a.crawledAt).getTime() - new Date(b.crawledAt).getTime()
          case "crawled-desc":
            return new Date(b.crawledAt).getTime() - new Date(a.crawledAt).getTime()
          default:
            return 0
        }
      })
    }, [results, filterBy, sortBy])

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading audit results...</p>
          </div>
        </div>
      )
    }

    return (
      <div ref={ref} className={cn("space-y-6", className)}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/?project=${project.id}`}>
                {project.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Audit Results</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/?project=${project.id}`}>
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Project
            </Link>
          </Button>
        </div>

        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <p className="text-muted-foreground">SEO Audit Results</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <GlobeIcon className="h-3 w-3" />
                {project.totalPages} pages
              </Badge>
              
              <Badge variant="outline" className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                Last crawled: {formatDate(project.latestCrawlDate)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg">
          <FilterSort
            sortBy={sortBy}
            filterBy={filterBy}
            onSortChange={setSortBy}
            onFilterChange={setFilterBy}
          />
          
          <div className="text-sm text-muted-foreground">
            Showing {filteredAndSortedResults.length} of {results.length} results
          </div>
        </div>

        {/* Results Grid */}
        {filteredAndSortedResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedResults.map((result) => (
              <AuditResultCard key={result.id} result={result} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <GlobeIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              {filterBy === "all" 
                ? "No audit results available for this project yet." 
                : `No results match the current filter: ${filterBy}`
              }
            </p>
            {filterBy !== "all" && (
              <Button 
                variant="outline" 
                onClick={() => setFilterBy("all")}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }
)
AuditResultsLayout.displayName = "AuditResultsLayout"

export { AuditResultsLayout, type ProjectInfo }
