# Changelog

All notable changes to the SEO Analyzer crawler will be documented in this file.

## [Unreleased] - 2024-12-19

### Added
- **Enhanced URL Logic**: Improved URL normalizer to retain non-cart internal routes while filtering cart functionality URLs
- **JavaScript Rendering Support**: Integrated Playwright with configurable max render time (default 5 seconds) and HTML snapshot capture
- **Enhanced Robots.txt Support**: Added support for explicitly allowed paths that bypass robots.txt restrictions
- **Realistic User Agent**: Updated default user agent to `Mozilla/5.0 (compatible; SEO-Analyzer-Bot/1.0; +https://seo-analyzer.com/bot)`

### Changed
- **URL Filtering Logic**: Modified `isSeoValueUrl()` to be more specific about cart URLs - now blocks `/cart/` but allows `/cart-category`
- **Crawler Interface**: Added `renderTime` and `allowedPaths` properties to `CrawlJob` interface
- **Robots.txt Checking**: Enhanced `isAllowed()` method to check both specific user agent and wildcard (*) rules
- **Link Extraction**: Now uses `extractSeoUrls()` for SEO-focused filtering during crawling

### Fixed
- **Non-cart Internal Routes**: URL normalizer now properly retains valuable internal routes that contain "cart" but aren't cart functionality
- **JavaScript Content**: Pages with dynamic content are now properly rendered before link extraction
- **Robots.txt Compliance**: Better handling of robots.txt rules while allowing explicitly permitted paths

### Technical Details

#### URL Logic Improvements
- Changed `/cart` pattern to `/cart/` to be more specific
- This allows URLs like `/cart-category`, `/shopping-cart-items` while blocking actual cart functionality
- Enhanced pattern matching for more accurate SEO value detection

#### JavaScript Rendering
- Added configurable `renderTime` parameter (default: 5000ms)
- Playwright now waits for dynamic content to load before extracting links
- HTML snapshot is captured after full rendering for accurate link discovery

#### Robots.txt Enhancements
- Added `allowedPaths` parameter to override robots.txt restrictions for specific paths
- Support for wildcard patterns in allowed paths (e.g., `/seo-pages/*`)
- Fallback to both specific user agent and wildcard (*) rules checking

#### User Agent Update
- Changed from `SEO-Analyzer-Bot/1.0 (+https://seo-analyzer.com/bot)` 
- To: `Mozilla/5.0 (compatible; SEO-Analyzer-Bot/1.0; +https://seo-analyzer.com/bot)`
- More realistic browser-like user agent while maintaining bot identification

### Performance
- Maintained efficient URL processing with improved filtering accuracy
- Added timeout controls for JavaScript rendering to prevent hanging
- Preserved caching mechanisms for robots.txt data

### Testing
- Updated test cases to reflect new URL filtering behavior
- Added test coverage for cart URL edge cases
- Performance tests confirmed sub-second processing for 1000+ URLs

---

## Migration Guide

### For Existing Implementations

1. **CrawlJob Interface Updates**:
   ```typescript
   // Add optional new properties
   const crawlJob: CrawlJob = {
     // ... existing properties
     renderTime: 5000, // Optional: max JS render time in ms
     allowedPaths: ['/special-seo-pages/*'], // Optional: override robots.txt
   };
   ```

2. **URL Filtering Changes**:
   - URLs like `/cart-category` and `/shopping-cart` will now be included
   - Actual cart functionality `/cart/`, `/checkout` remains excluded
   - No breaking changes to existing filtering logic

3. **User Agent Updates**:
   - Default user agent is now more browser-like
   - Custom user agents in existing jobs will continue to work unchanged

### Backward Compatibility
- All existing `CrawlJob` configurations remain fully compatible
- New features are opt-in via additional interface properties
- Default behavior maintains SEO-focused filtering while improving accuracy
