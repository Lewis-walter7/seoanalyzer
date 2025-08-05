# Shared Client Utilities & Components

This document describes the shared client utilities and atomic components available in the SEO Analyzer application.

## API Client (`lib/api.ts`)

Enhanced API client built on Axios with the following features:

- **Typed wrapper around Axios** with TypeScript support
- **Authentication token injection** with automatic refresh
- **Error mapping** to standardized format
- **GET/POST helpers** with consistent interface

### Usage

```typescript
import { api, ApiClient } from '@/lib/api';

// Using the default API instances
const projects = await api.external.get('/v1/projects');
const newProject = await api.external.post('/v1/projects', { name: 'My Project' });

// Creating custom API client
const customApi = new ApiClient('https://api.example.com', true);
const data = await customApi.get('/endpoint');
```

## Atomic Components

### FormCard (`components/FormCard.tsx`)

Reusable card wrapper for forms with consistent styling.

```typescript
import { FormCard } from '@/components';

<FormCard
  title="Login"
  description="Enter your credentials"
  error={error}
  isLoading={isLoading}
  footer={<Button>Submit</Button>}
>
  <Input placeholder="Email" />
  <Input placeholder="Password" type="password" />
</FormCard>
```

### ResultCard (`components/ResultCard.tsx`)

Card component for displaying results with optional actions.

```typescript
import { ResultCard } from '@/components';

<ResultCard
  title="Analysis Results"
  description="SEO analysis for your website"
  actions={<Button variant="outline">Export</Button>}
>
  <div>Your results content</div>
</ResultCard>
```

### LoadingSkeleton (`components/LoadingSkeleton.tsx`)

Animated loading placeholder.

```typescript
import { LoadingSkeleton } from '@/components';

<LoadingSkeleton count={3} className="h-6" />
```

### ErrorAlert (`components/ErrorAlert.tsx`)

Alert component for displaying error messages.

```typescript
import { ErrorAlert } from '@/components';

<ErrorAlert
  title="Error"
  message="Something went wrong"
  variant="error"
  onClose={() => setError(null)}
/>
```

### ChartComponent (`components/ChartComponent.tsx`)

Chart component using react-chartjs-2 with Tailwind theming.

```typescript
import { ChartComponent } from '@/components';

const chartData = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [{
    label: 'Traffic',
    data: [100, 200, 150]
  }]
};

<ChartComponent
  type="bar"
  data={chartData}
  title="Monthly Traffic"
  className="h-80"
/>
```

## Hooks

### useSeoTool (`hooks/useSeoTool.ts`)

Generic SWR hook for SEO tool API calls.

```typescript
import { useSeoTool } from '@/hooks';

// GET request
const { data, error, isLoading } = useSeoTool({
  endpoint: '/v1/projects',
  enabled: !!userId
});

// POST request with payload
const { data, error, isLoading } = useSeoTool({
  endpoint: '/v1/analyze',
  payload: { url: 'https://example.com' },
  method: 'POST'
});
```

### Convenience Hooks

```typescript
import { 
  useProjects, 
  useProjectAnalysis, 
  useKeywordAnalysis 
} from '@/hooks';

// Built-in hooks for common operations
const { data: projects } = useProjects();
const { data: analysis } = useProjectAnalysis(projectId);
const { data: keywords } = useKeywordAnalysis(['seo', 'react']);
```

## Theme Integration

All components use the existing Tailwind CSS theme from `app/globals.css`:

- Chart colors automatically use `--color-chart-1` through `--color-chart-5`
- Components respect light/dark mode
- Consistent spacing and typography

## Error Handling

All API calls return standardized error objects:

```typescript
interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}
```

## TypeScript Support

All components and utilities are fully typed with TypeScript interfaces exported for reuse.
