export declare class ViewportDto {
    width: number;
    height: number;
}
export declare class CreateCrawlJobDto {
    urls: string[];
    maxDepth: number;
    maxPages: number;
    userAgent?: string;
    disableJavaScript?: boolean;
    respectRobotsTxt?: boolean;
    crawlDelay?: number;
    allowedDomains?: string[];
    excludePatterns?: string[];
    includePatterns?: string[];
    customHeaders?: Record<string, string>;
    viewport?: ViewportDto;
    timeout?: number;
    retries?: number;
}
