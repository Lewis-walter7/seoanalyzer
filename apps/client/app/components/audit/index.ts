// Main layout component
export { AuditResultsLayout, type ProjectInfo } from './AuditResultsLayout';

// Individual card component
export { AuditResultCard, type AuditResult, type SeoMetric } from './AuditResultCard';

// Filter and sort controls
export { FilterSort, type SortOption, type FilterOption } from './FilterSort';

// Re-export UI components that are commonly used with audit components
export { SeoBadge, type SeoStatus } from '../../../components/ui/seo-badge';
export { Progress } from '../../../components/ui/progress';
export { Select } from '../../../components/ui/select';
export { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '../../../components/ui/breadcrumb';
