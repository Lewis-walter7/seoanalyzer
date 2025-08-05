// TypeScript interfaces and mock data generators for SEO analytics

export interface TrafficStat {
  date: string;
  visits: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface KeywordRank {
  id: string;
  keyword: string;
  position: number;
  previousPosition: number;
  searchVolume: number;
  difficulty: number;
  url: string;
  changeDirection: 'up' | 'down' | 'stable';
}

export interface Backlink {
  id: string;
  sourceUrl: string;
  sourceDomain: string;
  targetUrl: string;
  anchorText: string;
  domainAuthority: number;
  isFollow: boolean;
  dateFound: string;
  status: 'active' | 'lost' | 'new';
}

export interface ContentScore {
  id: string;
  url: string;
  title: string;
  seoScore: number;
  readabilityScore: number;
  wordCount: number;
  metaDescription: string;
  lastUpdated: string;
  issues: string[];
}

export interface CompetitorData {
  id: string;
  domain: string;
  organicTraffic: number;
  organicKeywords: number;
  backlinks: number;
  domainAuthority: number;
  topKeywords: string[];
}

export interface TechnicalIssue {
  id: string;
  type: 'error' | 'warning' | 'notice';
  category: 'crawling' | 'indexing' | 'performance' | 'mobile' | 'security';
  title: string;
  description: string;
  url: string;
  priority: 'high' | 'medium' | 'low';
  dateFound: string;
  status: 'open' | 'fixed' | 'ignored';
}

export interface RankingDistribution {
  position: string;
  count: number;
  percentage: number;
}

export interface SearchConsoleData {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
}

// Mock data generators

export const mockTraffic = (): TrafficStat[] => {
  return [...Array(30)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const baseVisits = 1200 + Math.floor(Math.random() * 800);
    
    return {
      date: date.toISOString().split('T')[0],
      visits: baseVisits,
      pageViews: Math.floor(baseVisits * (1.5 + Math.random() * 0.8)),
      bounceRate: Math.round((35 + Math.random() * 25) * 100) / 100,
      avgSessionDuration: Math.round((120 + Math.random() * 180) * 100) / 100,
    };
  });
};

export const mockKeywordRanks = (): KeywordRank[] => {
  const keywords = [
    'SEO analytics tool', 'keyword ranking tracker', 'backlink analysis',
    'content optimization', 'website SEO audit', 'search engine optimization',
    'SERP tracking', 'competitor analysis', 'organic traffic analysis',
    'technical SEO', 'local SEO tools', 'mobile SEO optimization',
    'page speed optimization', 'schema markup', 'meta tag optimization'
  ];

  return keywords.map((keyword, i) => {
    const position = Math.floor(Math.random() * 50) + 1;
    const previousPosition = position + Math.floor(Math.random() * 10) - 5;
    
    return {
      id: `kw-${i + 1}`,
      keyword,
      position,
      previousPosition: Math.max(1, previousPosition),
      searchVolume: Math.floor(Math.random() * 10000) + 500,
      difficulty: Math.floor(Math.random() * 100),
      url: `/blog/${keyword.replace(/\s+/g, '-').toLowerCase()}`,
      changeDirection: position < previousPosition ? 'up' : position > previousPosition ? 'down' : 'stable',
    };
  });
};

export const mockBacklinks = (): Backlink[] => {
  const domains = [
    'techcrunch.com', 'mashable.com', 'searchengineland.com', 'moz.com',
    'semrush.com', 'ahrefs.com', 'hubspot.com', 'wordstream.com',
    'backlinko.com', 'sejournal.com', 'socialmediatoday.com', 'contentking.com'
  ];

  return [...Array(25)].map((_, i) => {
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const status = ['active', 'lost', 'new'][Math.floor(Math.random() * 3)] as 'active' | 'lost' | 'new';
    
    return {
      id: `bl-${i + 1}`,
      sourceUrl: `https://${domain}/article-${i + 1}`,
      sourceDomain: domain,
      targetUrl: `https://yoursite.com/page-${Math.floor(Math.random() * 10) + 1}`,
      anchorText: ['SEO tool', 'analytics platform', 'optimization software', 'ranking tracker'][Math.floor(Math.random() * 4)],
      domainAuthority: Math.floor(Math.random() * 40) + 50,
      isFollow: Math.random() > 0.3,
      dateFound: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status,
    };
  });
};

export const mockContentScores = (): ContentScore[] => {
  const pages = [
    { url: '/blog/seo-best-practices', title: 'SEO Best Practices for 2024' },
    { url: '/guides/keyword-research', title: 'Complete Guide to Keyword Research' },
    { url: '/blog/technical-seo', title: 'Technical SEO Checklist' },
    { url: '/resources/link-building', title: 'Link Building Strategies' },
    { url: '/blog/content-optimization', title: 'Content Optimization Tips' },
    { url: '/guides/local-seo', title: 'Local SEO Guide' },
    { url: '/blog/mobile-seo', title: 'Mobile SEO Optimization' },
    { url: '/resources/seo-tools', title: 'Essential SEO Tools' },
  ];

  return pages.map((page, i) => {
    const seoScore = Math.floor(Math.random() * 40) + 60;
    const issues = [];
    
    if (seoScore < 70) issues.push('Missing meta description');
    if (seoScore < 75) issues.push('Low keyword density');
    if (Math.random() > 0.7) issues.push('No alt text on images');
    if (Math.random() > 0.8) issues.push('Slow page load time');

    return {
      id: `content-${i + 1}`,
      url: page.url,
      title: page.title,
      seoScore,
      readabilityScore: Math.floor(Math.random() * 30) + 70,
      wordCount: Math.floor(Math.random() * 2000) + 800,
      metaDescription: `${page.title} - Learn the latest strategies and techniques...`,
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      issues,
    };
  });
};

export const mockCompetitors = (): CompetitorData[] => {
  const competitors = [
    'semrush.com', 'ahrefs.com', 'moz.com', 'screaming-frog.co.uk',
    'spyfu.com', 'serpstat.com', 'kwfinder.com', 'seranking.com'
  ];

  return competitors.map((domain, i) => ({
    id: `comp-${i + 1}`,
    domain,
    organicTraffic: Math.floor(Math.random() * 500000) + 100000,
    organicKeywords: Math.floor(Math.random() * 50000) + 10000,
    backlinks: Math.floor(Math.random() * 1000000) + 100000,
    domainAuthority: Math.floor(Math.random() * 30) + 70,
    topKeywords: ['SEO software', 'keyword tool', 'backlink checker', 'rank tracker', 'SEO audit'],
  }));
};

export const mockTechnicalIssues = (): TechnicalIssue[] => {
  const issues = [
    {
      type: 'error' as const,
      category: 'crawling' as const,
      title: '404 Pages Found',
      description: 'Several pages are returning 404 errors and should be redirected or fixed.',
      priority: 'high' as const,
    },
    {
      type: 'warning' as const,
      category: 'performance' as const,
      title: 'Slow Page Load Times',
      description: 'Multiple pages have load times exceeding 3 seconds.',
      priority: 'medium' as const,
    },
    {
      type: 'warning' as const,
      category: 'mobile' as const,
      title: 'Mobile Usability Issues',
      description: 'Some pages have mobile usability problems affecting user experience.',
      priority: 'medium' as const,
    },
    {
      type: 'notice' as const,
      category: 'indexing' as const,
      title: 'Missing Meta Descriptions',
      description: 'Several pages are missing meta descriptions which could improve CTR.',
      priority: 'low' as const,
    },
    {
      type: 'error' as const,
      category: 'security' as const,
      title: 'Mixed Content Issues',
      description: 'HTTP resources loaded on HTTPS pages detected.',
      priority: 'high' as const,
    },
  ];

  return issues.map((issue, i) => ({
    id: `issue-${i + 1}`,
    ...issue,
    url: `/page-${Math.floor(Math.random() * 20) + 1}`,
    dateFound: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: ['open', 'fixed', 'ignored'][Math.floor(Math.random() * 3)] as 'open' | 'fixed' | 'ignored',
  }));
};

export const mockRankingDistribution = (): RankingDistribution[] => {
  return [
    { position: '1-3', count: 45, percentage: 15 },
    { position: '4-10', count: 120, percentage: 40 },
    { position: '11-20', count: 75, percentage: 25 },
    { position: '21-50', count: 45, percentage: 15 },
    { position: '51-100', count: 15, percentage: 5 },
  ];
};

export const mockSearchConsoleData = (): SearchConsoleData[] => {
  return [...Array(30)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const impressions = Math.floor(Math.random() * 5000) + 2000;
    const clicks = Math.floor(impressions * (0.02 + Math.random() * 0.08));
    
    return {
      date: date.toISOString().split('T')[0],
      clicks,
      impressions,
      ctr: Math.round((clicks / impressions) * 10000) / 100,
      averagePosition: Math.round((15 + Math.random() * 20) * 10) / 10,
    };
  });
};

// Helper function to get random subset of data
export const getRandomSubset = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Export all mock data as a single object for convenience
export const mockData = {
  traffic: mockTraffic(),
  keywords: mockKeywordRanks(),
  backlinks: mockBacklinks(),
  content: mockContentScores(),
  competitors: mockCompetitors(),
  technicalIssues: mockTechnicalIssues(),
  rankingDistribution: mockRankingDistribution(),
  searchConsole: mockSearchConsoleData(),
};
