import robotsParser from 'robots-parser';
import { RobotsTxtRule } from '../interfaces/crawler.interfaces';

export class RobotsUtil {
  private robotsCache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 3600000; // 1 hour in milliseconds

  /**
   * Get robots.txt for a domain and cache it
   */
  async getRobotsTxt(domain: string, userAgent: string = '*'): Promise<any> {
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

      const robots = robotsParser(robotsUrl, robotsTxt);
      
      // Cache the robots.txt data
      this.robotsCache.set(cacheKey, robots);
      this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);

      return robots;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[RobotsUtil] Failed to fetch robots.txt for ${domain}:`, (error as Error).message);
      }
      // Return a permissive robots.txt parser if we can't fetch it
      const robots = robotsParser(`${domain}/robots.txt`, '');
      this.robotsCache.set(cacheKey, robots);
      this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);
      return robots;
    }
  }

  /**
   * Check if a URL is allowed to be crawled according to robots.txt
   */
  async isAllowed(url: string, userAgent: string = '*'): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const domain = `${urlObj.protocol}//${urlObj.host}`;
      
      const robots = await this.getRobotsTxt(domain, userAgent);
      return robots.isAllowed(url, userAgent);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[RobotsUtil] Error checking robots.txt for ${url}:`, (error as Error).message);
      }
      // Default to allowing if we can't check
      return true;
    }
  }

  /**
   * Get the crawl delay for a specific user agent
   */
  async getCrawlDelay(url: string, userAgent: string = '*'): Promise<number | null> {
    try {
      const urlObj = new URL(url);
      const domain = `${urlObj.protocol}//${urlObj.host}`;
      
      const robots = await this.getRobotsTxt(domain, userAgent);
      const delay = robots.getCrawlDelay(userAgent);
      
      return delay ? delay * 1000 : null; // Convert to milliseconds
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[RobotsUtil] Error getting crawl delay for ${url}:`, (error as Error).message);
      }
      return null;
    }
  }

  /**
   * Get sitemap URLs from robots.txt
   */
  async getSitemaps(domain: string, userAgent: string = '*'): Promise<string[]> {
    try {
      const robots = await this.getRobotsTxt(domain, userAgent);
      return robots.getSitemaps() || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[RobotsUtil] Error getting sitemaps for ${domain}:`, (error as Error).message);
      }
      return [];
    }
  }

  /**
   * Parse robots.txt rules for a specific user agent
   */
  async parseRules(domain: string, userAgent: string = '*'): Promise<RobotsTxtRule> {
    try {
      const robots = await this.getRobotsTxt(domain, userAgent);
      
      // Get all rules for the user agent
      const rules = robots._rules || [];
      const userAgentRules = rules.filter((rule: any) => 
        rule.ua === '*' || rule.ua.toLowerCase() === userAgent.toLowerCase()
      );

      const allowRules: string[] = [];
      const disallowRules: string[] = [];
      let crawlDelay: number | undefined;

      userAgentRules.forEach((rule: any) => {
        if (rule.allow) allowRules.push(...rule.allow);
        if (rule.disallow) disallowRules.push(...rule.disallow);
        if (rule.crawlDelay) crawlDelay = rule.crawlDelay;
      });

      return {
        userAgent,
        allow: allowRules,
        disallow: disallowRules,
        crawlDelay: crawlDelay ? crawlDelay * 1000 : undefined, // Convert to milliseconds
        sitemap: await this.getSitemaps(domain, userAgent),
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[RobotsUtil] Error parsing robots.txt rules for ${domain}:`, (error as Error).message);
      }
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
  clearCache(): void {
    this.robotsCache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { entries: number; hitRate?: number } {
    return {
      entries: this.robotsCache.size,
    };
  }
}
