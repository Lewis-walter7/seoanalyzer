"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotsUtil = void 0;
const robots_parser_1 = require("robots-parser");
class RobotsUtil {
    robotsCache = new Map();
    cacheExpiry = new Map();
    CACHE_DURATION = 3600000; // 1 hour in milliseconds
    /**
     * Get robots.txt for a domain and cache it
     */
    async getRobotsTxt(domain, userAgent = '*') {
        const cacheKey = `${domain}:${userAgent}`;
        const now = Date.now();
        // Check if we have cached data that's still valid
        const expiry = this.cacheExpiry.get(cacheKey);
        if (this.robotsCache.has(cacheKey) && expiry && expiry > now) {
            return this.robotsCache.get(cacheKey);
        }
        try {
            const robotsUrl = `${domain}/robots.txt`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(robotsUrl, {
                signal: controller.signal,
                headers: {
                    'User-Agent': userAgent,
                },
            });
            clearTimeout(timeoutId);
            let robotsTxt = '';
            if (response.ok) {
                robotsTxt = await response.text();
            }
            const robots = (0, robots_parser_1.default)(robotsUrl, robotsTxt);
            // Cache the robots.txt data
            this.robotsCache.set(cacheKey, robots);
            this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);
            return robots;
        }
        catch (error) {
            console.warn(`Failed to fetch robots.txt for ${domain}:`, error.message);
            // Return a permissive robots.txt parser if we can't fetch it
            const robots = (0, robots_parser_1.default)(`${domain}/robots.txt`, '');
            this.robotsCache.set(cacheKey, robots);
            this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);
            return robots;
        }
    }
    /**
     * Check if a URL is allowed to be crawled according to robots.txt
     */
    async isAllowed(url, userAgent = '*') {
        try {
            const urlObj = new URL(url);
            const domain = `${urlObj.protocol}//${urlObj.host}`;
            const robots = await this.getRobotsTxt(domain, userAgent);
            return robots.isAllowed(url, userAgent);
        }
        catch (error) {
            console.warn(`Error checking robots.txt for ${url}:`, error.message);
            // Default to allowing if we can't check
            return true;
        }
    }
    /**
     * Get the crawl delay for a specific user agent
     */
    async getCrawlDelay(url, userAgent = '*') {
        try {
            const urlObj = new URL(url);
            const domain = `${urlObj.protocol}//${urlObj.host}`;
            const robots = await this.getRobotsTxt(domain, userAgent);
            const delay = robots.getCrawlDelay(userAgent);
            return delay ? delay * 1000 : null; // Convert to milliseconds
        }
        catch (error) {
            console.warn(`Error getting crawl delay for ${url}:`, error.message);
            return null;
        }
    }
    /**
     * Get sitemap URLs from robots.txt
     */
    async getSitemaps(domain, userAgent = '*') {
        try {
            const robots = await this.getRobotsTxt(domain, userAgent);
            return robots.getSitemaps() || [];
        }
        catch (error) {
            console.warn(`Error getting sitemaps for ${domain}:`, error.message);
            return [];
        }
    }
    /**
     * Parse robots.txt rules for a specific user agent
     */
    async parseRules(domain, userAgent = '*') {
        try {
            const robots = await this.getRobotsTxt(domain, userAgent);
            // Get all rules for the user agent
            const rules = robots._rules || [];
            const userAgentRules = rules.filter((rule) => rule.ua === '*' || rule.ua.toLowerCase() === userAgent.toLowerCase());
            const allowRules = [];
            const disallowRules = [];
            let crawlDelay;
            userAgentRules.forEach((rule) => {
                if (rule.allow)
                    allowRules.push(...rule.allow);
                if (rule.disallow)
                    disallowRules.push(...rule.disallow);
                if (rule.crawlDelay)
                    crawlDelay = rule.crawlDelay;
            });
            return {
                userAgent,
                allow: allowRules,
                disallow: disallowRules,
                crawlDelay: crawlDelay ? crawlDelay * 1000 : undefined, // Convert to milliseconds
                sitemap: await this.getSitemaps(domain, userAgent),
            };
        }
        catch (error) {
            console.warn(`Error parsing robots.txt rules for ${domain}:`, error.message);
            return {
                userAgent,
                allow: [],
                disallow: [],
                sitemap: [],
            };
        }
    }
    /**
     * Clear the robots.txt cache
     */
    clearCache() {
        this.robotsCache.clear();
        this.cacheExpiry.clear();
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            entries: this.robotsCache.size,
        };
    }
}
exports.RobotsUtil = RobotsUtil;
