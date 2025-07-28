# Frontend Integration Guide

This guide shows how to integrate with the SEO Analyzer CrawlerService from various frontend frameworks.

## API Endpoints

The CrawlerService exposes the following REST API endpoints:

### Base URL
```
http://localhost:3001/api/crawler
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/jobs` | Start a new crawl job |
| `GET` | `/jobs/{jobId}` | Get crawl job status |
| `DELETE` | `/jobs/{jobId}` | Cancel a crawl job |
| `GET` | `/jobs` | Get all active crawl jobs |
| `GET` | `/stats` | Get crawler statistics |
| `POST` | `/options` | Update crawler options |
| `GET` | `/health` | Health check |

## JavaScript/TypeScript Examples

### 1. Basic Fetch API Usage

```typescript
// Types (copy from the backend interfaces)
interface CrawlJob {
  urls: string[];
  maxDepth: number;
  maxPages: number;
  userAgent?: string;
  disableJavaScript?: boolean;
  respectRobotsTxt?: boolean;
  crawlDelay?: number;
  allowedDomains?: string[];
  excludePatterns?: string[];
  includePatterns?: string[];
  customHeaders?: Record<string, string>;
  viewport?: {
    width: number;
    height: number;
  };
  timeout?: number;
  retries?: number;
}

interface CrawledPage {
  url: string;
  title?: string;
  statusCode: number;
  contentType?: string;
  size: number;
  loadTime: number;
  depth: number;
  parentUrl?: string;
  links: string[];
  assets: {
    images: string[];
    scripts: string[];
    stylesheets: string[];
  };
  meta: {
    description?: string;
    keywords?: string;
    robots?: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  timestamp: Date;
}

interface CrawlResult {
  jobId: string;
  pages: CrawledPage[];
  errors: any[];
  progress: {
    totalUrls: number;
    processedUrls: number;
    pendingUrls: number;
    errorUrls: number;
    currentDepth: number;
    startTime: Date;
  };
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
}

// API Client Class
class CrawlerApiClient {
  private baseUrl = 'http://localhost:3001/api/crawler';

  async startCrawl(crawlJob: Partial<CrawlJob>): Promise<{ jobId: string }> {
    const response = await fetch(`${this.baseUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(crawlJob),
    });

    if (!response.ok) {
      throw new Error(`Failed to start crawl: ${response.statusText}`);
    }

    return response.json();
  }

  async getCrawlStatus(jobId: string): Promise<CrawlResult> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get crawl status: ${response.statusText}`);
    }

    return response.json();
  }

  async cancelCrawl(jobId: string): Promise<{ cancelled: boolean }> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel crawl: ${response.statusText}`);
    }

    return response.json();
  }

  async getActiveCrawls(): Promise<{ jobs: string[] }> {
    const response = await fetch(`${this.baseUrl}/jobs`);
    
    if (!response.ok) {
      throw new Error(`Failed to get active crawls: ${response.statusText}`);
    }

    return response.json();
  }

  async getCrawlerStats(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to get crawler stats: ${response.statusText}`);
    }

    return response.json();
  }
}

// Usage Example
async function exampleUsage() {
  const client = new CrawlerApiClient();

  try {
    // Start a crawl
    const { jobId } = await client.startCrawl({
      urls: ['https://example.com'],
      maxDepth: 2,
      maxPages: 50,
      respectRobotsTxt: true,
      crawlDelay: 1000,
    });

    console.log('Crawl started:', jobId);

    // Poll for status updates
    const pollInterval = setInterval(async () => {
      try {
        const status = await client.getCrawlStatus(jobId);
        console.log('Progress:', status.progress);

        if (status.completed) {
          clearInterval(pollInterval);
          console.log('Crawl completed:', status);
          console.log('Pages found:', status.pages.length);
        }
      } catch (error) {
        console.error('Error polling status:', error);
        clearInterval(pollInterval);
      }
    }, 5000); // Poll every 5 seconds

  } catch (error) {
    console.error('Error starting crawl:', error);
  }
}
```

### 2. React Hook Example

```tsx
import React, { useState, useEffect, useCallback } from 'react';

interface UseCrawlerResult {
  startCrawl: (job: Partial<CrawlJob>) => Promise<string>;
  cancelCrawl: (jobId: string) => Promise<void>;
  crawlStatus: CrawlResult | null;
  isLoading: boolean;
  error: string | null;
}

export const useCrawler = (): UseCrawlerResult => {
  const [crawlStatus, setCrawlStatus] = useState<CrawlResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const client = new CrawlerApiClient();

  const startCrawl = useCallback(async (job: Partial<CrawlJob>): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const { jobId } = await client.startCrawl(job);
      setCurrentJobId(jobId);
      return jobId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelCrawl = useCallback(async (jobId: string): Promise<void> => {
    try {
      await client.cancelCrawl(jobId);
      setCurrentJobId(null);
      setCrawlStatus(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Poll for status updates
  useEffect(() => {
    if (!currentJobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await client.getCrawlStatus(currentJobId);
        setCrawlStatus(status);

        if (status.completed) {
          setCurrentJobId(null);
        }
      } catch (err) {
        setError(err.message);
        setCurrentJobId(null);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [currentJobId]);

  return {
    startCrawl,
    cancelCrawl,
    crawlStatus,
    isLoading,
    error,
  };
};

// React Component Example
export const CrawlerDashboard: React.FC = () => {
  const { startCrawl, cancelCrawl, crawlStatus, isLoading, error } = useCrawler();
  const [url, setUrl] = useState('');

  const handleStartCrawl = async () => {
    if (!url) return;

    try {
      await startCrawl({
        urls: [url],
        maxDepth: 2,
        maxPages: 100,
        respectRobotsTxt: true,
        crawlDelay: 1000,
      });
    } catch (err) {
      console.error('Failed to start crawl:', err);
    }
  };

  const handleCancelCrawl = async () => {
    if (crawlStatus?.jobId) {
      try {
        await cancelCrawl(crawlStatus.jobId);
      } catch (err) {
        console.error('Failed to cancel crawl:', err);
      }
    }
  };

  return (
    <div className="crawler-dashboard">
      <h2>SEO Crawler Dashboard</h2>
      
      <div className="crawl-form">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          disabled={isLoading}
        />
        <button onClick={handleStartCrawl} disabled={isLoading || !url}>
          {isLoading ? 'Starting...' : 'Start Crawl'}
        </button>
      </div>

      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      {crawlStatus && (
        <div className="crawl-status">
          <h3>Crawl Status: {crawlStatus.jobId}</h3>
          <div className="progress">
            <p>Processed: {crawlStatus.progress.processedUrls}</p>
            <p>Pending: {crawlStatus.progress.pendingUrls}</p>
            <p>Errors: {crawlStatus.progress.errorUrls}</p>
            <p>Current Depth: {crawlStatus.progress.currentDepth}</p>
          </div>

          {!crawlStatus.completed && (
            <button onClick={handleCancelCrawl}>Cancel Crawl</button>
          )}

          {crawlStatus.completed && (
            <div className="results">
              <h4>Results</h4>
              <p>Total Pages: {crawlStatus.pages.length}</p>
              <p>Duration: {crawlStatus.totalDuration}ms</p>
              
              <div className="pages">
                {crawlStatus.pages.map((page, index) => (
                  <div key={index} className="page">
                    <h5>{page.title || page.url}</h5>
                    <p>Status: {page.statusCode}</p>
                    <p>Size: {page.size} bytes</p>
                    <p>Links: {page.links.length}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### 3. Vue.js Composition API Example

```vue
<template>
  <div class="crawler-dashboard">
    <h2>SEO Crawler Dashboard</h2>
    
    <div class="crawl-form">
      <input
        v-model="url"
        type="url"
        placeholder="Enter website URL"
        :disabled="isLoading"
      />
      <button @click="handleStartCrawl" :disabled="isLoading || !url">
        {{ isLoading ? 'Starting...' : 'Start Crawl' }}
      </button>
    </div>

    <div v-if="error" class="error">
      Error: {{ error }}
    </div>

    <div v-if="crawlStatus" class="crawl-status">
      <h3>Crawl Status: {{ crawlStatus.jobId }}</h3>
      <div class="progress">
        <p>Processed: {{ crawlStatus.progress.processedUrls }}</p>
        <p>Pending: {{ crawlStatus.progress.pendingUrls }}</p>
        <p>Errors: {{ crawlStatus.progress.errorUrls }}</p>
        <p>Current Depth: {{ crawlStatus.progress.currentDepth }}</p>
      </div>

      <button v-if="!crawlStatus.completed" @click="handleCancelCrawl">
        Cancel Crawl
      </button>

      <div v-if="crawlStatus.completed" class="results">
        <h4>Results</h4>
        <p>Total Pages: {{ crawlStatus.pages.length }}</p>
        <p>Duration: {{ crawlStatus.totalDuration }}ms</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCrawler } from './composables/useCrawler';

const { startCrawl, cancelCrawl, crawlStatus, isLoading, error } = useCrawler();
const url = ref('');

const handleStartCrawl = async () => {
  if (!url.value) return;

  try {
    await startCrawl({
      urls: [url.value],
      maxDepth: 2,
      maxPages: 100,
      respectRobotsTxt: true,
      crawlDelay: 1000,
    });
  } catch (err) {
    console.error('Failed to start crawl:', err);
  }
};

const handleCancelCrawl = async () => {
  if (crawlStatus.value?.jobId) {
    try {
      await cancelCrawl(crawlStatus.value.jobId);
    } catch (err) {
      console.error('Failed to cancel crawl:', err);
    }
  }
};
</script>
```

### 4. Svelte Example

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  
  let url = '';
  let crawlStatus = null;
  let isLoading = false;
  let error = null;
  let currentJobId = null;
  let pollInterval = null;

  const client = new CrawlerApiClient();

  async function startCrawl() {
    if (!url) return;

    isLoading = true;
    error = null;

    try {
      const { jobId } = await client.startCrawl({
        urls: [url],
        maxDepth: 2,
        maxPages: 100,
        respectRobotsTxt: true,
        crawlDelay: 1000,
      });

      currentJobId = jobId;
      startPolling();
    } catch (err) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  }

  async function cancelCrawl() {
    if (currentJobId) {
      try {
        await client.cancelCrawl(currentJobId);
        currentJobId = null;
        crawlStatus = null;
        stopPolling();
      } catch (err) {
        error = err.message;
      }
    }
  }

  function startPolling() {
    pollInterval = setInterval(async () => {
      if (!currentJobId) return;

      try {
        const status = await client.getCrawlStatus(currentJobId);
        crawlStatus = status;

        if (status.completed) {
          currentJobId = null;
          stopPolling();
        }
      } catch (err) {
        error = err.message;
        stopPolling();
      }
    }, 2000);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  onDestroy(() => {
    stopPolling();
  });
</script>

<div class="crawler-dashboard">
  <h2>SEO Crawler Dashboard</h2>
  
  <div class="crawl-form">
    <input
      bind:value={url}
      type="url"
      placeholder="Enter website URL"
      disabled={isLoading}
    />
    <button on:click={startCrawl} disabled={isLoading || !url}>
      {isLoading ? 'Starting...' : 'Start Crawl'}
    </button>
  </div>

  {#if error}
    <div class="error">
      Error: {error}
    </div>
  {/if}

  {#if crawlStatus}
    <div class="crawl-status">
      <h3>Crawl Status: {crawlStatus.jobId}</h3>
      <div class="progress">
        <p>Processed: {crawlStatus.progress.processedUrls}</p>
        <p>Pending: {crawlStatus.progress.pendingUrls}</p>
        <p>Errors: {crawlStatus.progress.errorUrls}</p>
        <p>Current Depth: {crawlStatus.progress.currentDepth}</p>
      </div>

      {#if !crawlStatus.completed}
        <button on:click={cancelCrawl}>Cancel Crawl</button>
      {/if}

      {#if crawlStatus.completed}
        <div class="results">
          <h4>Results</h4>
          <p>Total Pages: {crawlStatus.pages.length}</p>
          <p>Duration: {crawlStatus.totalDuration}ms</p>
        </div>
      {/if}
    </div>
  {/if}
</div>
```

## WebSocket Integration (Future Enhancement)

For real-time updates, you could implement WebSocket support:

```typescript
class CrawlerWebSocketClient {
  private ws: WebSocket;
  private listeners: Map<string, Function[]> = new Map();

  constructor(url: string = 'ws://localhost:3001') {
    this.ws = new WebSocket(url);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit(data.type, data.payload);
    };
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  subscribeToJob(jobId: string) {
    this.ws.send(JSON.stringify({
      type: 'subscribe',
      jobId,
    }));
  }
}

// Usage
const wsClient = new CrawlerWebSocketClient();

wsClient.on('page-crawled', (page) => {
  console.log('New page crawled:', page);
});

wsClient.on('crawl-progress', (progress) => {
  console.log('Progress update:', progress);
});

wsClient.on('crawl-finished', (result) => {
  console.log('Crawl completed:', result);
});

wsClient.subscribeToJob(jobId);
```

## Error Handling Best Practices

```typescript
class CrawlerApiClientWithRetry extends CrawlerApiClient {
  private async fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        
        if (response.status >= 500 && i < retries - 1) {
          await this.delay(1000 * Math.pow(2, i)); // Exponential backoff
          continue;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.delay(1000 * Math.pow(2, i));
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Testing the API

You can test the API endpoints using curl:

```bash
# Start a crawl
curl -X POST http://localhost:3001/api/crawler/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://example.com"],
    "maxDepth": 2,
    "maxPages": 50,
    "respectRobotsTxt": true,
    "crawlDelay": 1000
  }'

# Get crawl status
curl http://localhost:3001/api/crawler/jobs/{jobId}

# Get crawler stats
curl http://localhost:3001/api/crawler/stats

# Cancel a crawl
curl -X DELETE http://localhost:3001/api/crawler/jobs/{jobId}
```

## Rate Limiting and Best Practices

1. **Implement client-side rate limiting** to avoid overwhelming the server
2. **Use polling intervals** of 2-5 seconds for status updates
3. **Handle network errors gracefully** with retry logic
4. **Implement proper loading states** in your UI
5. **Cache results** when appropriate to reduce API calls
6. **Use WebSockets** for real-time updates in production
7. **Implement proper error boundaries** in React/Vue applications

This integration guide provides everything you need to connect your frontend application to the SEO Analyzer CrawlerService!
