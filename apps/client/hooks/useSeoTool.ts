'use client';

import { useMemo } from 'react';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { api, ApiError } from '@/lib/api';

export interface UseSeoToolOptions extends SWRConfiguration {
  endpoint: string;
  payload?: any;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  enabled?: boolean;
}

export interface UseSeoToolResponse<T = any> extends Omit<SWRResponse<T, ApiError>, 'error'> {
  data: T | undefined;
  error: ApiError | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: SWRResponse<T, ApiError>['mutate'];
}

// SWR fetcher function that handles different HTTP methods
const fetcher = async ({ endpoint, payload, method = 'GET' }: {
  endpoint: string;
  payload?: any;
  method?: string;
}) => {
  switch (method.toUpperCase()) {
    case 'GET':
      return api.external.get(endpoint);
    case 'POST':
      return api.external.post(endpoint, payload);
    case 'PUT':
      return api.external.put(endpoint, payload);
    case 'PATCH':
      return api.external.patch(endpoint, payload);
    case 'DELETE':
      return api.external.delete(endpoint);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
};

/**
 * Generic SWR hook for SEO tool API calls
 * 
 * @param options - Configuration object with endpoint, payload, method, and SWR options
 * @returns Object with data, error, isLoading, isValidating, and mutate
 * 
 * @example
 * ```tsx
 * // GET request
 * const { data, error, isLoading } = useSeoTool({
 *   endpoint: '/v1/projects',
 *   enabled: !!projectId
 * });
 * 
 * // POST request with payload
 * const { data, error, isLoading } = useSeoTool({
 *   endpoint: '/v1/projects/analyze',
 *   payload: { url: 'https://example.com' },
 *   method: 'POST'
 * });
 * ```
 */
export function useSeoTool<T = any>({
  endpoint,
  payload,
  method = 'GET',
  enabled = true,
  ...swrOptions
}: UseSeoToolOptions): UseSeoToolResponse<T> {
  // Create a stable key for SWR caching
  const swrKey = useMemo(() => {
    if (!enabled) return null;
    
    const keyObject = {
      endpoint,
      payload: payload || null,
      method,
    };
    
    return JSON.stringify(keyObject);
  }, [endpoint, payload, method, enabled]);

  const {
    data,
    error,
    isLoading: swrIsLoading,
    isValidating,
    mutate,
  } = useSWR<T, ApiError>(
    swrKey,
    swrKey ? () => fetcher({ endpoint, payload, method }) : null,
    {
      // Default configuration
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      dedupingInterval: 5000,
      // Allow custom options to override defaults
      ...swrOptions,
    }
  );

  // For non-GET requests, we consider it loading if SWR is validating
  // For GET requests, we use the standard isLoading
  const isLoading = method === 'GET' ? swrIsLoading : isValidating;

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

/**
 * Convenience hooks for common SEO tool operations
 */

// Hook specifically for projects
export function useProjects(enabled = true) {
  return useSeoTool<any[]>({
    endpoint: '/v1/projects',
    enabled,
  });
}

// Hook for project analysis
export function useProjectAnalysis(projectId?: string, enabled = true) {
  return useSeoTool({
    endpoint: `/v1/projects/${projectId}/analysis`,
    enabled: enabled && !!projectId,
  });
}

// Hook for keyword analysis
export function useKeywordAnalysis(keywords: string[], enabled = true) {
  return useSeoTool({
    endpoint: '/v1/keywords/analyze',
    payload: { keywords },
    method: 'POST',
    enabled: enabled && keywords.length > 0,
  });
}

// Hook for competitor analysis
export function useCompetitorAnalysis(domain: string, competitors: string[], enabled = true) {
  return useSeoTool({
    endpoint: '/v1/competitors/analyze',
    payload: { domain, competitors },
    method: 'POST',
    enabled: enabled && !!domain && competitors.length > 0,
  });
}

export default useSeoTool;
