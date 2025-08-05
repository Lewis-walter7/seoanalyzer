export declare enum SearchEngine {
    GOOGLE = "GOOGLE",
    BING = "BING",
    YAHOO = "YAHOO",
    DUCKDUCKGO = "DUCKDUCKGO"
}
export declare enum Device {
    DESKTOP = "DESKTOP",
    MOBILE = "MOBILE",
    TABLET = "TABLET"
}
export declare class SerpAnalysisDto {
    keyword: string;
    serpData: any;
    searchEngine?: SearchEngine;
    location?: string;
    device?: Device;
    projectId?: string;
}
export declare class SerpResult {
    position: number;
    title: string;
    url: string;
    description: string;
    displayUrl: string;
    type: 'organic' | 'paid' | 'local' | 'shopping' | 'news' | 'image' | 'video';
    features: string[];
    metadata: {
        hasImages: boolean;
        hasVideo: boolean;
        hasRichSnippet: boolean;
        datePublished: string | null;
        author: string | null;
        rating: number | null;
        price: string | null;
    };
}
export declare class SerpFeature {
    type: 'knowledge_graph' | 'featured_snippet' | 'local_pack' | 'people_also_ask' | 'related_searches' | 'shopping_results' | 'news_box' | 'image_pack' | 'video_carousel';
    position: number;
    content: any;
}
export declare class ContentDetail {
    averageTitleLength: number;
    averageDescriptionLength: number;
    totalDomains: number;
    topDomains: Array<{
        domain: string;
        count: number;
        percentage: number;
    }>;
    hasRichSnippets: boolean;
    hasImages: boolean;
    hasVideos: boolean;
    competitionLevel: 'low' | 'medium' | 'high';
}
export declare class SerpAnalysisResult {
    id: string;
    userId: string;
    keyword: string;
    searchEngine: SearchEngine;
    location: string;
    device: Device;
    timestamp: Date;
    totalResults: number;
    organicResults: SerpResult[];
    paidResults: SerpResult[];
    features: SerpFeature[];
    contentAnalysis: ContentDetail;
    results: SerpResult[];
}
