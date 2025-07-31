import * as React from "react"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type SortOption = 
  | "url-asc" 
  | "url-desc" 
  | "performance-asc" 
  | "performance-desc" 
  | "crawled-asc" 
  | "crawled-desc"

export type FilterOption = "all" | "good" | "warning" | "issue"

interface FilterSortProps {
  sortBy: SortOption
  filterBy: FilterOption
  onSortChange: (value: SortOption) => void
  onFilterChange: (value: FilterOption) => void
  className?: string
}

const FilterSort = React.forwardRef<HTMLDivElement, FilterSortProps>(
  ({ sortBy, filterBy, onSortChange, onFilterChange, className }, ref) => {
    return (
      <div ref={ref} className={cn("flex flex-col sm:flex-row gap-4", className)}>
        {/* Filter Dropdown */}
        <div className="flex flex-col gap-2">
          <label htmlFor="filter" className="text-sm font-medium">
            Filter by Status
          </label>
          <Select
            id="filter"
            value={filterBy}
            onChange={(e) => onFilterChange(e.target.value as FilterOption)}
            className="w-full sm:w-48"
          >
            <option value="all">All Results</option>
            <option value="good">Good Performance</option>
            <option value="warning">Needs Attention</option>
            <option value="issue">Critical Issues</option>
          </Select>
        </div>

        {/* Sort Dropdown */}
        <div className="flex flex-col gap-2">
          <label htmlFor="sort" className="text-sm font-medium">
            Sort by
          </label>
          <Select
            id="sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full sm:w-48"
          >
            <option value="url-asc">URL (A-Z)</option>
            <option value="url-desc">URL (Z-A)</option>
            <option value="performance-desc">Performance (High to Low)</option>
            <option value="performance-asc">Performance (Low to High)</option>
            <option value="crawled-desc">Latest Crawled</option>
            <option value="crawled-asc">Oldest Crawled</option>
          </Select>
        </div>
      </div>
    )
  }
)
FilterSort.displayName = "FilterSort"

export { FilterSort }
