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
 * Extract all URLs from HTML content (focuses on href links for crawling)
 */
export declare function extractUrls(html: string, baseUrl: string): string[];
/**
 * Get URL depth relative to a base URL - FIXED VERSION
 */
/**
 * Get URL depth relative to a base URL - FIXED VERSION
 */
export declare function getUrlDepth(url: string, baseUrl: string): number;
/**
 * Check if URL is SEO-valuable (excludes functional URLs that don't provide SEO value)
 */
export declare function isSeoValueUrl(url: string): boolean;
/**
 * Get recommended exclude patterns for SEO-focused crawling
 */
export declare function getSeoExcludePatterns(): string[];
/**
 * Get recommended include patterns for SEO-focused crawling
 */
export declare function getSeoIncludePatterns(): string[];
/**
 * Extract URLs from HTML with SEO-focused filtering
 */
export declare function extractSeoUrls(html: string, baseUrl: string): string[];
/**
 * Generate a unique identifier for a URL crawl
 */
export declare function generateCrawlId(): string;
