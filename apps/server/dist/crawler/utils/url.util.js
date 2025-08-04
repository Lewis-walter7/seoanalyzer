"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeUrl = normalizeUrl;
exports.resolveUrl = resolveUrl;
exports.matchesPatterns = matchesPatterns;
exports.extractDomain = extractDomain;
exports.isSameDomain = isSameDomain;
exports.isAllowedDomain = isAllowedDomain;
exports.isValidUrl = isValidUrl;
exports.extractUrls = extractUrls;
exports.getUrlDepth = getUrlDepth;
exports.isSeoValueUrl = isSeoValueUrl;
exports.getSeoExcludePatterns = getSeoExcludePatterns;
exports.getSeoIncludePatterns = getSeoIncludePatterns;
exports.extractSeoUrls = extractSeoUrls;
exports.generateCrawlId = generateCrawlId;
exports.extractDomainVariations = extractDomainVariations;
/**
 * Normalize a URL by removing fragments, sorting query parameters, etc.
 */
function normalizeUrl(url) {
    try {
        const urlObj = new URL(url);
        // Remove fragment
        urlObj.hash = '';
        // Sort query parameters for consistency
        const params = Array.from(urlObj.searchParams.entries()).sort();
        urlObj.search = '';
        params.forEach(([key, value]) => urlObj.searchParams.append(key, value));
        // Remove trailing slash unless it's the root path
        if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
            urlObj.pathname = urlObj.pathname.slice(0, -1);
        }
        return urlObj.toString();
    }
    catch (error) {
        return url; // Return original if parsing fails
    }
}
/**
 * Resolve a relative URL against a base URL
 */
function resolveUrl(baseUrl, relativeUrl) {
    try {
        return new URL(relativeUrl, baseUrl).toString();
    }
    catch (error) {
        return relativeUrl; // Return original if resolution fails
    }
}
/**
 * Check if a URL matches any of the given patterns
 */
function matchesPatterns(url, patterns) {
    if (!patterns || patterns.length === 0)
        return false;
    return patterns.some(pattern => {
        try {
            // Simple wildcard pattern matching
            const regex = new RegExp(pattern
                .replace(/\./g, '\\.')
                .replace(/\*/g, '.*')
                .replace(/\?/g, '\\?'), 'i');
            return regex.test(url);
        }
        catch (error) {
            // Fallback to simple string matching
            return url.toLowerCase().includes(pattern.toLowerCase());
        }
    });
}
/**
 * Extract domain from URL
 */
function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return `${urlObj.protocol}//${urlObj.host}`;
    }
    catch (error) {
        return '';
    }
}
/**
 * Check if URL is same domain as base URL
 */
function isSameDomain(url, baseUrl) {
    try {
        const urlObj = new URL(url);
        const baseObj = new URL(baseUrl);
        return urlObj.host === baseObj.host;
    }
    catch (error) {
        return false;
    }
}
/**
 * Check if URL is allowed based on domain restrictions
 */
function isAllowedDomain(url, allowedDomains) {
    if (!allowedDomains || allowedDomains.length === 0)
        return true;
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.toLowerCase();
        return allowedDomains.some(allowed => {
            const allowedDomain = allowed.toLowerCase();
            return domain === allowedDomain || domain.endsWith(`.${allowedDomain}`);
        });
    }
    catch (error) {
        return false;
    }
}
/**
 * Check if URL is valid and crawlable
 */
function isValidUrl(url) {
    try {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol.toLowerCase();
        // Only allow HTTP and HTTPS
        if (protocol !== 'http:' && protocol !== 'https:') {
            return false;
        }
        // Check for common non-crawlable file extensions
        const nonCrawlableExtensions = [
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            '.zip', '.rar', '.tar', '.gz', '.7z',
            '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico',
            '.mp3', '.mp4', '.avi', '.mov', '.wav', '.wmv',
            '.exe', '.dmg', '.pkg', '.deb', '.rpm',
            '.css', '.js', '.json', '.xml', '.txt'
        ];
        const pathname = urlObj.pathname.toLowerCase();
        const hasNonCrawlableExtension = nonCrawlableExtensions.some(ext => pathname.endsWith(ext));
        if (hasNonCrawlableExtension) {
            return false;
        }
        return true;
    }
    catch (error) {
        return false;
    }
}
/**
 * Extract all URLs from HTML content (focuses on href links for crawling)
 */
function extractUrls(html, baseUrl) {
    const urls = [];
    // Regular expression to find URLs in href attributes
    const linkRegex = /href=[\"']([^\"']+)[\"']/gi;
    let match;
    // Extract href URLs (main navigation and content links)
    while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1].trim();
        // Skip empty hrefs, anchors, javascript, and mailto links
        if (!href || href === '#' || href.startsWith('#') ||
            href.startsWith('javascript:') || href.startsWith('mailto:') ||
            href.startsWith('tel:') || href.startsWith('sms:')) {
            continue;
        }
        try {
            const url = resolveUrl(baseUrl, href);
            if (isValidUrl(url)) {
                urls.push(normalizeUrl(url));
            }
        }
        catch (error) {
            // Skip invalid URLs
            continue;
        }
    }
    // Remove duplicates
    return Array.from(new Set(urls));
}
function getUrlDepth(url, baseUrl) {
    try {
        const urlObj = new URL(url);
        const baseObj = new URL(baseUrl);
        // If different domains, return max depth to exclude them
        if (urlObj.host !== baseObj.host) {
            return Infinity;
        }
        // Clean and split paths, removing empty segments
        const urlPath = urlObj.pathname.split('/').filter(segment => segment.length > 0);
        const basePath = baseObj.pathname.split('/').filter(segment => segment.length > 0);
        // For same domain URLs, use a simple depth calculation from root
        // This is more permissive and allows discovery of all pages on the same domain
        return urlPath.length;
    }
    catch (error) {
        return Infinity;
    }
}
/**
 * Check if URL is SEO-valuable (excludes functional URLs that don't provide SEO value)
 */
function isSeoValueUrl(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();
        const search = urlObj.search.toLowerCase();
        const protocol = urlObj.protocol.toLowerCase();
        // Only allow HTTP and HTTPS protocols
        if (protocol !== 'http:' && protocol !== 'https:') {
            return false;
        }
        const fullUrl = url.toLowerCase();
        // First, exclude clearly functional URLs that don't provide SEO value
        const functionalPatterns = [
            // E-commerce functionality (but allow product/category pages)
            '?add-to-cart=',
            '&add-to-cart=',
            'add-to-cart',
            '/checkout',
            '/cart/',
            '/cart',
            '/basket/',
            '/my-account',
            // Admin and authentication
            '/wp-admin',
            '/wp-login',
            '/login',
            '/register',
            '/signup',
            '/password-reset',
            '/lost-password',
            '/forgot-password',
            // Session and tracking parameters
            '?action=',
            '&action=',
            '?wc-ajax=',
            '&wc-ajax=',
            '?_wpnonce=',
            '&_wpnonce=',
            '?utm_',
            '&utm_',
            '?fbclid=',
            '&fbclid=',
            // API endpoints and feeds
            '/api/',
            '/wp-json/',
            '/rest/',
            '/graphql',
            '/feed',
            '/rss',
            '.xml',
            '/sitemap',
            // Search and filtering (often duplicate content)
            '?s=',
            '&s=',
            '?search=',
            '&search=',
            '?orderby=',
            '&orderby=',
            '?sort=',
            '&sort=',
            '?paged=',
            '&paged=',
            '?page=',
            '&page=',
            '?filter=',
            '&filter=',
            // Common functional paths
            '/wp-content/',
            '/wp-includes/',
            '/node_modules/',
            '/vendor/',
            '/assets/',
            '/static/',
            '/public/',
            // Tracking and analytics
            'google-analytics',
            'facebook.com/tr',
            'doubleclick',
            'googletagmanager',
        ];
        // Check if URL matches any functional pattern that should be excluded
        const isFunctional = functionalPatterns.some(pattern => fullUrl.includes(pattern));
        if (isFunctional) {
            return false;
        }
        // Be more permissive - allow most URLs that aren't explicitly functional
        // This approach is better for discovering content
        return true;
    }
    catch (error) {
        return false;
    }
}
/**
 * Get recommended exclude patterns for SEO-focused crawling
 */
function getSeoExcludePatterns() {
    return [
        // Cart and checkout functionality
        '*add-to-cart*',
        '*/cart*',
        '*/checkout*',
        '*/my-account*',
        // Admin and authentication
        '*/wp-admin*',
        '*/wp-login*',
        '*/admin*',
        '*/login*',
        '*/register*',
        '*password*',
        // API and feeds
        '*/api/*',
        '*/wp-json/*',
        '*/feed*',
        '*.xml',
        '*/sitemap*',
        // Search and filters (often duplicate content)
        '*?s=*',
        '*?orderby=*',
        '*?paged=*',
        '*?action=*',
        '*?wc-ajax=*',
        '*_wpnonce=*',
        // Media files (not SEO content)
        '*.jpg',
        '*.jpeg',
        '*.png',
        '*.gif',
        '*.svg',
        '*.ico',
        '*.pdf',
        '*.doc*',
        '*.xls*',
        '*.zip',
        '*.rar',
        // Scripts and styles
        '*.js',
        '*.css',
        '*.min.*',
    ];
}
/**
 * Get recommended include patterns for SEO-focused crawling
 */
function getSeoIncludePatterns() {
    return [
        // Main content pages (use more specific patterns)
        '*//', // Root path (domain.com/)
        '*/about*',
        '*/contact*',
        '*/services*',
        '*/products*',
        '*/shop*',
        '*/blog*',
        '*/news*',
        '*/faq*',
        // Category and taxonomy pages
        '*/category/*',
        '*/product/*',
        '*/brand/*',
        '*/tag/*',
        // Content pages
        '*/page/*',
        '*/post/*',
        '*/article/*',
        // Location-based pages
        '*/location/*',
        '*/store/*',
        '*/branch/*',
    ];
}
/**
 * Extract URLs from HTML with SEO-focused filtering
 */
function extractSeoUrls(html, baseUrl) {
    const allUrls = extractUrls(html, baseUrl);
    return allUrls.filter(url => {
        // First check if it's a valid URL
        if (!isValidUrl(url)) {
            return false;
        }
        // Then check if it's SEO valuable
        return isSeoValueUrl(url);
    });
}
/**
 * Generate a unique identifier for a URL crawl
 */
function generateCrawlId() {
    return `crawl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Extract domain variations from a URL for comprehensive domain matching
 * Generates variations including root domain, dot-prefixed domain, www subdomain, and existing subdomains
 * Uses public suffix list to properly identify the effective top-level domain (eTLD+1)
 */
function extractDomainVariations(url) {
    try {
        // Import tldts for public suffix list parsing
        const { parse } = require('tldts');
        // Normalize the URL first
        const normalizedUrl = normalizeUrl(url);
        const urlObj = new URL(normalizedUrl);
        // Parse the domain using public suffix list
        const parsed = parse(urlObj.hostname);
        if (!parsed.domain || !parsed.publicSuffix) {
            return [];
        }
        const variations = new Set();
        // Get the effective top-level domain (eTLD+1) - domain + public suffix
        const eTLD1 = parsed.domain;
        // Add root domain (eTLD+1)
        variations.add(eTLD1);
        // Add dot-prefixed domain for wildcard matching
        variations.add(`.${eTLD1}`);
        // Add www subdomain if not already present
        if (!urlObj.hostname.startsWith('www.')) {
            variations.add(`www.${eTLD1}`);
        }
        // Add the original hostname if it's different from eTLD+1 (has subdomains)
        if (urlObj.hostname !== eTLD1) {
            variations.add(urlObj.hostname);
            // Also add dot-prefixed version of the full hostname
            variations.add(`.${urlObj.hostname}`);
        }
        // If the original hostname has subdomains, also add common subdomain variations
        if (parsed.subdomain) {
            const subdomains = parsed.subdomain.split('.');
            // Add each level of subdomain
            for (let i = 0; i < subdomains.length; i++) {
                const partialSubdomain = subdomains.slice(i).join('.');
                const domainWithSubdomain = `${partialSubdomain}.${eTLD1}`;
                variations.add(domainWithSubdomain);
                variations.add(`.${domainWithSubdomain}`);
            }
        }
        return Array.from(variations).sort();
    }
    catch (error) {
        // Return empty array for invalid URLs or parsing errors
        return [];
    }
}
