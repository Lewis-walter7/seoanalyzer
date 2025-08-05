'use client';

import { useSeoTool } from '@/hooks/useSeoTool';

export interface RankTrackerRequest {
  domain: string;
  keywords: string[];
  searchEngine: 'google' | 'bing' | 'yahoo';
}

export interface RankTrackerResult {
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  change: number;
  url?: string;
  searchEngine: string;
  lastChecked: string;
}

export interface RankTrackerResponse {
  domain: string;
  searchEngine: string;
  results: RankTrackerResult[];
  totalKeywords: number;
  averagePosition: number;
  positionsImproved: number;
  positionsDeclined: number;
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      keyword: string;
    }[];
  };
}

/**
 * Custom hook for rank tracking using SWR
 * 
 * @param request - The rank tracker request parameters
 * @param enabled - Whether the request should be enabled
 * @returns SWR response with rank tracker data
 * 
 * @example
 * ```tsx
 * const { data, error, isLoading, mutate } = useRankTracker({
 *   domain: 'https://example.com',
 *   keywords: ['seo', 'marketing'],
 *   searchEngine: 'google'
 * }, !!domain && keywords.length > 0);
 * ```
 */
export function useRankTracker(request: RankTrackerRequest, enabled = true) {
  return useSeoTool<RankTrackerResponse>({
    endpoint: '/api/tools/rank-tracker',
    payload: request,
    method: 'POST',
    enabled: enabled && !!request.domain && request.keywords.length > 0,
    // Don't cache rank tracker results by default since they change frequently
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0,
  });
}

export default useRankTracker;
