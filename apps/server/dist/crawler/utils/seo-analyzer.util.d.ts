export interface SeoAuditData {
    titleTag?: string;
    titleLength?: number;
    titleExists: boolean;
    titleTooLong: boolean;
    titleTooShort: boolean;
    metaDescription?: string;
    metaDescriptionLength?: number;
    metaDescriptionExists: boolean;
    metaDescriptionTooLong: boolean;
    metaDescriptionTooShort: boolean;
    h1Count: number;
    h1Tags: string[];
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
    hasMultipleH1: boolean;
    missingH1: boolean;
    canonicalUrl?: string;
    hasCanonical: boolean;
    robotsContent?: string;
    hasRobotsMeta: boolean;
    isIndexable: boolean;
    isFollowable: boolean;
    hasSchemaOrg: boolean;
    schemaOrgTypes: string[];
    jsonLdCount: number;
    microdataCount: number;
    rdfaCount: number;
    totalImages: number;
    imagesWithoutAlt: number;
    imagesWithAlt: number;
    imagesWithoutTitle: number;
    imagesOptimized: boolean;
    internalLinksCount: number;
    externalLinksCount: number;
    brokenLinksCount: number;
    noFollowLinksCount: number;
    internalLinks: string[];
    externalLinks: string[];
    brokenLinks: string[];
    loadTime?: number;
    pageSize?: number;
    wordCount?: number;
    contentRatio?: number;
    hasValidLang: boolean;
    languageCode?: string;
    hasOpenGraph: boolean;
    hasTwitterCard: boolean;
    hasViewport: boolean;
    hasCharset: boolean;
    isHttps: boolean;
    hasSitemapReference: boolean;
    seoScore?: number;
    performanceScore?: number;
    accessibilityScore?: number;
    issues?: string[];
}
export declare class SeoAnalyzer {
    analyzeHtml(html: string, url?: string): SeoAuditData;
    private extractTagContent;
    extractTagContentPublic(html: string, tag: string): string | null;
    private extractTagContents;
    private extractMetaContent;
    private extractCanonicalUrl;
    private extractLangAttribute;
    private countTags;
    private analyzeImages;
    private analyzeLinks;
    private analyzeStructuredData;
    private analyzeSocialMeta;
    private analyzeTechnicalSeo;
    private countWords;
    private calculateContentRatio;
    /**
     * Calculate SEO score based on various SEO factors (0-100)
     */
    private calculateSeoScore;
    /**
     * Calculate performance score based on load time and page size (0-100)
     */
    calculatePerformanceScore(pageSize?: number, loadTime?: number): number;
    /**
     * Calculate accessibility score based on various accessibility factors (0-100)
     */
    private calculateAccessibilityScore;
    /**
     * Update performance score with actual load time data
     */
    updatePerformanceScore(auditData: SeoAuditData, loadTime: number): SeoAuditData;
}
