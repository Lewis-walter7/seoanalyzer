/**
 * Normalize a URL by removing fragments, sorting query parameters, etc.
 */
export function normalizeUrl(url: string): string {
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
  } catch (error) {
    return url; // Return original if parsing fails
  }
}

/**
 * Resolve a relative URL against a base URL
 */
export function resolveUrl(baseUrl: string, relativeUrl: string): string {
  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch (error) {
    return relativeUrl; // Return original if resolution fails
  }
}

/**
 * Check if a URL matches any of the given patterns
 */
export function matchesPatterns(url: string, patterns: string[]): boolean {
  if (!patterns || patterns.length === 0) return false;
  
  return patterns.some(pattern => {
    try {
      // Simple wildcard pattern matching
      const regex = new RegExp(
        pattern
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '\\?'),
        'i'
      );
      return regex.test(url);
    } catch (error) {
      // Fallback to simple string matching
      return url.toLowerCase().includes(pattern.toLowerCase());
    }
  });
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}`;
  } catch (error) {
    return '';
  }
}

/**
 * Check if URL is same domain as base URL
 */
export function isSameDomain(url: string, baseUrl: string): boolean {
  try {
    const urlObj = new URL(url);
    const baseObj = new URL(baseUrl);
    return urlObj.host === baseObj.host;
  } catch (error) {
    return false;
  }
}

/**
 * Check if URL is allowed based on domain restrictions
 */
export function isAllowedDomain(url: string, allowedDomains?: string[]): boolean {
  if (!allowedDomains || allowedDomains.length === 0) return true;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    
    return allowedDomains.some(allowed => {
      const allowedDomain = allowed.toLowerCase();
      return domain === allowedDomain || domain.endsWith(`.${allowedDomain}`);
    });
  } catch (error) {
    return false;
  }
}

/**
 * Check if URL is valid and crawlable
 */
export function isValidUrl(url: string): boolean {
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
    const hasNonCrawlableExtension = nonCrawlableExtensions.some(ext => 
      pathname.endsWith(ext)
    );
    
    if (hasNonCrawlableExtension) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extract all URLs from HTML content
 */
export function extractUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  
  // Regular expressions to find URLs in href and src attributes
  const linkRegex = /href=[\"']([^\"']+)[\"']/gi;
  const srcRegex = /src=[\"']([^\"']+)[\"']/gi;
  
  let match;
  
  // Extract href URLs
  while ((match = linkRegex.exec(html)) !== null) {
    const url = resolveUrl(baseUrl, match[1]);
    if (isValidUrl(url)) {
      urls.push(normalizeUrl(url));
    }
  }
  
  // Extract src URLs (for completeness, though we might filter these out later)
  while ((match = srcRegex.exec(html)) !== null) {
    const url = resolveUrl(baseUrl, match[1]);
    if (isValidUrl(url)) {
      urls.push(normalizeUrl(url));
    }
  }
  
  // Remove duplicates
  return Array.from(new Set(urls));
}

/**
 * Get URL depth relative to a base URL
 */
export function getUrlDepth(url: string, baseUrl: string): number {
  try {
    const urlObj = new URL(url);
    const baseObj = new URL(baseUrl);
    
    // If different domains, return max depth
    if (urlObj.host !== baseObj.host) {
      return Infinity;
    }
    
    const urlPath = urlObj.pathname.split('/').filter(segment => segment.length > 0);
    const basePath = baseObj.pathname.split('/').filter(segment => segment.length > 0);
    
    // Calculate depth as the difference in path segments
    return Math.max(0, urlPath.length - basePath.length);
  } catch (error) {
    return Infinity;
  }
}

/**
 * Generate a unique identifier for a URL crawl
 */
export function generateCrawlId(): string {
  return `crawl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
