export interface TrafficData {
  competitor: string;
  organicTraffic: number;
  paidTraffic: number;
  totalVisitors: number;
  bounceRate: number;
}

export interface KeywordGap {
  keyword: string;
  yourRank: number | null;
  competitorRank: number;
  searchVolume: number;
  difficulty: number;
  opportunity: 'high' | 'medium' | 'low';
}

export interface ContentMetrics {
  competitor: string;
  totalPages: number;
  averageWordCount: number;
  averageLoadTime: number;
  mobileOptimized: number;
  contentScore: number;
  topPerformingContent: {
    title: string;
    url: string;
    shares: number;
    backlinks: number;
  }[];
  contentTypes: {
    blog: number;
    product: number;
    landing: number;
    other: number;
  };
}

export interface BacklinkData {
  url: string;
  totalBacklinks: number;
  authorityScore: number;
  referringDomains: number;
  lostBacklinks: number;
  gainedBacklinks: number;
  competitorTrend: number[];
}
