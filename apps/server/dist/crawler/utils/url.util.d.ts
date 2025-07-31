/**
 * Normalize a URL by removing fragments, sorting query parameters, etc.
 */
export declare function normalizeUrl(url: string): string;
/**
 * Resolve a relative URL against a base URL
 */
export declare function resolveUrl(baseUrl: string, relativeUrl: string): string;
/**
 * Check if a URL matches any of the given patterns
 */
export declare function matchesPatterns(url: string, patterns: string[]): boolean;
/**
 * Extract domain from URL
 */
export declare function extractDomain(url: string): string;
/**
 * Check if URL is same domain as base URL
 */
export declare function isSameDomain(url: string, baseUrl: string): boolean;
/**
 * Check if URL is allowed based on domain restrictions
 */
export declare function isAllowedDomain(url: string, allowedDomains?: string[]): boolean;
/**
 * Check if URL is valid and crawlable
 */
export declare function isValidUrl(url: string): boolean;
/**
 * Extract all URLs from HTML content
 */
export declare function extractUrls(html: string, baseUrl: string): string[];
/**
 * Get URL depth relative to a base URL
 */
export declare function getUrlDepth(url: string, baseUrl: string): number;
/**
 * Generate a unique identifier for a URL crawl
 */
export declare function generateCrawlId(): string;
