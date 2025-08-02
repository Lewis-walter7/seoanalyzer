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
/**
 * Get URL depth relative to a base URL - FIXED VERSION
 */
// export function getUrlDepth(url: string, baseUrl: string): number {
//   try {
//     const urlObj = new URL(url);
//     const baseObj = new URL(baseUrl);
//     // If different domains, return max depth
//     if (urlObj.host !== baseObj.host) {
//       return Infinity;
//     }
//     // Clean and split paths, removing empty segments
//     const urlPath = urlObj.pathname.split('/').filter(segment => segment.length > 0);
//     const basePath = baseObj.pathname.split('/').filter(segment => segment.length > 0);
//     // For same domain URLs, calculate depth from root
//     // This allows discovery of all pages on the same domain
//     return urlPath.length;
//   } catch (error) {
//     return Infinity;
//   }
// }
/**
 * Get URL depth relative to a base URL - FIXED VERSION
 */
function getUrlDepth(url, baseUrl) {
    try {
        const urlObj = new URL(url);
        const baseObj = new URL(baseUrl);
        // If different domains, return max depth
        if (urlObj.host !== baseObj.host) {
            return Infinity;
        }
        // Clean and split paths, removing empty segments
        const urlPath = urlObj.pathname.split('/').filter(segment => segment.length > 0);
        const basePath = baseObj.pathname.split('/').filter(segment => segment.length > 0);
        // For same domain URLs, calculate depth from root
        // This allows discovery of all pages on the same domain
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
        // Exclude functional URLs that don't provide SEO value
        const functionalPatterns = [
            // E-commerce functionality (but allow product/category cart pages)
            '/add-to-cart',
            '?add-to-cart=',
            '&add-to-cart=',
            '/cart/', // Changed to be more specific - allows /cart-category but not /cart/
            '/checkout',
            '/basket/',
            '/my-account',
            '/account/',
            '/user/',
            '/profile/',
            // Admin and authentication
            '/admin',
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
            '?q=',
            '&q=',
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
            // File downloads (not SEO content)
            '.pdf',
            '.doc',
            '.docx',
            '.xls',
            '.xlsx',
            '.zip',
            '.rar',
            '.tar',
            '.gz',
            // Media files
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.svg',
            '.webp',
            '.ico',
            '.mp3',
            '.mp4',
            '.avi',
            '.mov',
            '.wav',
            // Scripts and styles
            '.js',
            '.css',
            '.min.',
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
        // Check if URL matches any functional pattern
        const isFunctional = functionalPatterns.some(pattern => fullUrl.includes(pattern));
        if (isFunctional) {
            return false;
        }
        // For simple paths and root, consider them valuable
        if (pathname === '/' || pathname.split('/').filter(Boolean).length <= 3) {
            return true;
        }
        // Include common SEO-valuable content patterns
        const seoValuePatterns = [
            // Main content pages
            '/about',
            '/contact',
            '/services',
            '/products',
            '/blog',
            '/news',
            '/articles',
            '/faq',
            '/help',
            '/support',
            '/privacy',
            '/terms',
            '/policy',
            // E-commerce content (not functionality)
            '/category/',
            '/categories/',
            '/product/',
            '/products/',
            '/brand/',
            '/brands/',
            '/shop',
            '/store',
            '/collection/',
            '/collections/',
            // Content management
            '/page/',
            '/pages/',
            '/post/',
            '/posts/',
            '/article/',
            '/articles/',
            '/content/',
            // Location and business info
            '/location/',
            '/locations/',
            '/store/',
            '/stores/',
            '/branch/',
            '/branches/',
            '/contact/',
            // Industries and sectors
            '/industry/',
            '/industries/',
            '/sector/',
            '/sectors/',
            '/solution/',
            '/solutions/',
            // Resources and learning
            '/resource/',
            '/resources/',
            '/guide/',
            '/guides/',
            '/tutorial/',
            '/tutorials/',
            '/case-study/',
            '/case-studies/',
            '/whitepaper/',
            '/whitepapers/',
        ];
        // Check if URL matches any SEO valuable pattern
        const isSeoValuable = seoValuePatterns.some(pattern => fullUrl.includes(pattern));
        return isSeoValuable;
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
