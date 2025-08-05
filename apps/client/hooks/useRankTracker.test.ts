import { renderHook, waitFor } from '@testing-library/react';
import { useRankTracker } from './useRankTracker';

// Mock the useSeoTool hook
jest.mock('./useSeoTool', () => ({
  useSeoTool: jest.fn(),
}));

import { useSeoTool } from './useSeoTool';

const mockUseSeoTool = useSeoTool as jest.MockedFunction<typeof useSeoTool>;

describe('useRankTracker', () => {
  beforeEach(() => {
    mockUseSeoTool.mockClear();
  });

  it('calls useSeoTool with correct parameters', () => {
    const request = {
      domain: 'https://example.com',
      keywords: ['seo', 'marketing'],
      searchEngine: 'google' as const,
    };

    mockUseSeoTool.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    renderHook(() => useRankTracker(request, true));

    expect(mockUseSeoTool).toHaveBeenCalledWith({
      endpoint: '/api/tools/rank-tracker',
      payload: request,
      method: 'POST',
      enabled: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
    });
  });

  it('disables the request when domain is empty', () => {
    const request = {
      domain: '',
      keywords: ['seo'],
      searchEngine: 'google' as const,
    };

    mockUseSeoTool.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    renderHook(() => useRankTracker(request, true));

    expect(mockUseSeoTool).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('disables the request when keywords array is empty', () => {
    const request = {
      domain: 'https://example.com',
      keywords: [],
      searchEngine: 'google' as const,
    };

    mockUseSeoTool.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    renderHook(() => useRankTracker(request, true));

    expect(mockUseSeoTool).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('disables the request when enabled parameter is false', () => {
    const request = {
      domain: 'https://example.com',
      keywords: ['seo'],
      searchEngine: 'google' as const,
    };

    mockUseSeoTool.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    renderHook(() => useRankTracker(request, false));

    expect(mockUseSeoTool).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('returns the correct data structure', () => {
    const request = {
      domain: 'https://example.com',
      keywords: ['seo'],
      searchEngine: 'google' as const,
    };

    const mockData = {
      domain: 'https://example.com',
      searchEngine: 'google',
      results: [
        {
          keyword: 'seo',
          currentPosition: 5,
          previousPosition: 8,
          change: 3,
          url: 'https://example.com/page-for-seo',
          searchEngine: 'google',
          lastChecked: '2023-10-01T00:00:00Z',
        },
      ],
      totalKeywords: 1,
      averagePosition: 5,
      positionsImproved: 1,
      positionsDeclined: 0,
      chartData: {
        labels: ['7 days ago', 'Today'],
        datasets: [
          { label: 'seo', data: [8, 5], keyword: 'seo' },
        ],
      },
    };

    mockUseSeoTool.mockReturnValue({
      data: mockData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useRankTracker(request, true));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('handles loading state correctly', () => {
    const request = {
      domain: 'https://example.com',
      keywords: ['seo'],
      searchEngine: 'google' as const,
    };

    mockUseSeoTool.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: true,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useRankTracker(request, true));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('handles error state correctly', () => {
    const request = {
      domain: 'https://example.com',
      keywords: ['seo'],
      searchEngine: 'google' as const,
    };

    const mockError = {
      message: 'Invalid domain format',
      status: 400,
    };

    mockUseSeoTool.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useRankTracker(request, true));

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
  });

  it('supports different search engines', () => {
    const engines = ['google', 'bing', 'yahoo'] as const;

    engines.forEach((engine) => {
      const request = {
        domain: 'https://example.com',
        keywords: ['seo'],
        searchEngine: engine,
      };

      mockUseSeoTool.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      renderHook(() => useRankTracker(request, true));

      expect(mockUseSeoTool).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            searchEngine: engine,
          }),
        })
      );
    });
  });
});
