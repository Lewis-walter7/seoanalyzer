import { RobotsTxtRule } from '../interfaces/crawler.interfaces';
export declare class RobotsUtil {
    private robotsCache;
    private cacheExpiry;
    private readonly CACHE_DURATION;
    /**
     * Get robots.txt for a domain and cache it
     */
    getRobotsTxt(domain: string, userAgent?: string): Promise<any>;
    /**
     * Check if a URL is allowed to be crawled according to robots.txt
     * with enhanced support for explicitly allowed paths
     */
    isAllowed(url: string, userAgent?: string, allowedPaths?: string[]): Promise<boolean>;
    /**
     * Get the crawl delay for a specific user agent
     */
    getCrawlDelay(url: string, userAgent?: string): Promise<number | null>;
    /**
     * Get sitemap URLs from robots.txt
     */
    getSitemaps(domain: string, userAgent?: string): Promise<string[]>;
    /**
     * Parse robots.txt rules for a specific user agent
     */
    parseRules(domain: string, userAgent?: string): Promise<RobotsTxtRule>;
    /**
     * Clear the robots.txt cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        entries: number;
        hitRate?: number;
    };
}
