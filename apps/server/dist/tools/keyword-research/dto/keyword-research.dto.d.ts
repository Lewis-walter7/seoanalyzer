export declare enum SearchEngine {
    GOOGLE = "GOOGLE",
    BING = "BING",
    YAHOO = "YAHOO"
}
export declare enum Device {
    DESKTOP = "DESKTOP",
    MOBILE = "MOBILE",
    TABLET = "TABLET"
}
export declare class CreateKeywordResearchDto {
    name: string;
    description?: string;
    projectId: string;
    seedKeywords: string[];
    searchEngine?: SearchEngine;
    location?: string;
    language?: string;
    device?: Device;
}
export declare class UpdateKeywordResearchDto {
    name?: string;
    description?: string;
    seedKeywords?: string[];
    searchEngine?: SearchEngine;
    location?: string;
    language?: string;
    device?: Device;
}
export declare class KeywordAnalysisDto {
    keywords: string[];
    includeSearchVolume?: boolean;
    includeCompetition?: boolean;
    includeCpc?: boolean;
    includeTrends?: boolean;
}
export declare class KeywordMetric {
    keyword: string;
    searchVolume?: number;
    competition?: number;
    cpc?: number;
    difficulty?: number;
    trends?: number[];
}
export declare class KeywordSuggestion {
    keyword: string;
    relevanceScore: number;
    searchVolume?: number;
    category?: string;
}
