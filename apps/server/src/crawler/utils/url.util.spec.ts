import {
  extractUrls,
  extractSeoUrls,
  isSeoValueUrl,
  getSeoExcludePatterns,
  getSeoIncludePatterns,
  normalizeUrl,
  resolveUrl,
  isValidUrl,
  matchesPatterns,
  extractDomainVariations
} from './url.util';

describe('URL Utilities', () => {
  const baseUrl = 'https://ontime.co.ke';

  describe('extractUrls', () => {
    it('should extract href URLs from HTML', () => {
      const html = `
        <html>
          <body>
            <a href="/about">About</a>
            <a href="/product/camera">Camera</a>
            <a href="https://external.com">External</a>
          </body>
        </html>
      `;

      const urls = extractUrls(html, baseUrl);
      expect(urls).toContain('https://ontime.co.ke/about');
      expect(urls).toContain('https://ontime.co.ke/product/camera');
      // Check that the external URL is included (might have trailing slash after normalization)
      const hasExternalUrl = urls.some(url => url.startsWith('https://external.com'));
      expect(hasExternalUrl).toBe(true);
    });

    it('should skip non-href URLs and invalid links', () => {
      const html = `
        <html>
          <body>
            <a href="#anchor">Anchor Link</a>
            <a href="javascript:void(0)">JavaScript Link</a>
            <a href="mailto:test@example.com">Email Link</a>
            <a href="/valid-page">Valid Page</a>
            <img src="/image.jpg" alt="Image">
            <script src="/script.js"></script>
          </body>
        </html>
      `;

      const urls = extractUrls(html, baseUrl);
      expect(urls).toContain('https://ontime.co.ke/valid-page');
      expect(urls).not.toContain('https://ontime.co.ke/image.jpg'); // src URLs not extracted
      expect(urls).not.toContain('https://ontime.co.ke/script.js'); // src URLs not extracted
      expect(urls.length).toBe(1); // Only the valid page link
    });

    it('should handle malformed HTML gracefully', () => {
      const html = `
        <a href="/valid">Valid Link</a>
        <a href="">Empty href</a>
        <a>No href</a>
      `;

      const urls = extractUrls(html, baseUrl);
      expect(urls).toContain('https://ontime.co.ke/valid');
      expect(urls).not.toContain('https://ontime.co.ke/');
    });
  });

  describe('isSeoValueUrl', () => {
    it('should identify SEO valuable URLs', () => {
      const valuableUrls = [
        'https://ontime.co.ke/',
        'https://ontime.co.ke/about',
        'https://ontime.co.ke/contact',
        'https://ontime.co.ke/products',
        'https://ontime.co.ke/category/cameras',
        'https://ontime.co.ke/product/nikon-d850',
        'https://ontime.co.ke/brand/canon',
        'https://ontime.co.ke/blog',
        'https://ontime.co.ke/news/latest',
        'https://ontime.co.ke/faq',
        'https://ontime.co.ke/services'
      ];

      valuableUrls.forEach(url => {
        expect(isSeoValueUrl(url)).toBe(true);
      });
    });

    it('should identify non-SEO valuable URLs', () => {
      const nonValuableUrls = [
        'https://ontime.co.ke/?add-to-cart=123',
        'https://ontime.co.ke/add-to-cart',
        'https://ontime.co.ke/cart/', // Note: /cart/ is blocked but /cart-category would be allowed
        'https://ontime.co.ke/checkout',
        'https://ontime.co.ke/my-account',
        'https://ontime.co.ke/wp-admin',
        'https://ontime.co.ke/wp-login.php',
        'https://ontime.co.ke/?action=login',
        'https://ontime.co.ke/?wc-ajax=add_to_cart',
        'https://ontime.co.ke/?s=search+term',
        'https://ontime.co.ke/api/products',
        'https://ontime.co.ke/wp-json/wp/v2/posts',
        'https://ontime.co.ke/feed',
        'https://ontime.co.ke/sitemap.xml',
        'https://ontime.co.ke/?orderby=price',
        'https://ontime.co.ke/?paged=2'
      ];

      nonValuableUrls.forEach(url => {
        expect(isSeoValueUrl(url)).toBe(false);
      });
    });
  });

  describe('extractSeoUrls with ontime.co.ke HTML snippet', () => {
    it('should extract only SEO valuable URLs from ontime.co.ke homepage sample', () => {
      // Representative HTML snippet from ontime.co.ke
      const ontimeHtml = `
        <html>
          <head>
            <title>OnTime Photography Equipment - Kenya</title>
          </head>
          <body>
            <!-- Navigation -->
            <nav>
              <a href="/">Home</a>
              <a href="/about-us-2">About Us</a>
              <a href="/contact-us-2">Contact</a>
              <a href="/shop-3">Shop</a>
              <a href="/faqs">FAQs</a>
            </nav>

            <!-- Product Categories -->
            <div class="categories">
              <a href="/camera-accessories">Camera Accessories</a>
              <a href="/storage-devices">Storage Devices</a>
              <a href="/batteries">Batteries</a>
              <a href="/bags-accessories">Bags & Accessories</a>
              <a href="/lenses">Lenses</a>
              <a href="/audio-equipments">Audio Equipment</a>
            </div>

            <!-- Brand Links -->
            <div class="brands">
              <a href="/brand/canon">Canon</a>
              <a href="/brand/nikon">Nikon</a>
              <a href="/brand/sony">Sony</a>
              <a href="/brand/godox">Godox</a>
            </div>

            <!-- Product Links -->
            <div class="products">
              <a href="/godox-sl60iibi-bi-color-led-video-light">Godox SL60IIBi</a>
              <a href="/canon-eos-rp-mirrorless-camera-body-only">Canon EOS RP</a>
              <a href="/caisi-cs-kr105cm-umbrella-beauty-dish-softbox">Caisi Softbox</a>
            </div>

            <!-- E-commerce Functionality (should be excluded) -->
            <div class="ecommerce">
              <a href="?add-to-cart=18294" class="add-to-cart">Add to Cart</a>
              <a href="?add-to-cart=18240" class="add-to-cart">Add to Cart</a>
              <a href="/cart">View Cart</a>
              <a href="/checkout">Checkout</a>
              <a href="/my-account">My Account</a>
              <a href="?action=register">Register</a>
              <a href="?s=godox+v1">Search Results</a>
              <a href="?orderby=price">Sort by Price</a>
            </div>

            <!-- Admin/System URLs (should be excluded) -->
            <div class="system">
              <a href="/wp-admin">Admin</a>
              <a href="/wp-json/wp/v2/posts">API</a>
              <a href="/feed">RSS Feed</a>
              <a href="/sitemap.xml">Sitemap</a>
            </div>

            <!-- Social Media (external, may be excluded) -->
            <div class="social">
              <a href="https://facebook.com/ontime">Facebook</a>
              <a href="https://instagram.com/ontime">Instagram</a>
            </div>
          </body>
        </html>
      `;

      const extractedUrls = extractSeoUrls(ontimeHtml, baseUrl);

      // URLs that SHOULD be extracted (SEO valuable)
      const expectedSeoUrls = [
        'https://ontime.co.ke/',
        'https://ontime.co.ke/about-us-2',
        'https://ontime.co.ke/contact-us-2',
        'https://ontime.co.ke/shop-3',
        'https://ontime.co.ke/faqs',
        'https://ontime.co.ke/camera-accessories',
        'https://ontime.co.ke/storage-devices',
        'https://ontime.co.ke/batteries',
        'https://ontime.co.ke/bags-accessories',
        'https://ontime.co.ke/lenses',
        'https://ontime.co.ke/audio-equipments',
        'https://ontime.co.ke/brand/canon',
        'https://ontime.co.ke/brand/nikon',
        'https://ontime.co.ke/brand/sony',
        'https://ontime.co.ke/brand/godox',
        'https://ontime.co.ke/godox-sl60iibi-bi-color-led-video-light',
        'https://ontime.co.ke/canon-eos-rp-mirrorless-camera-body-only',
        'https://ontime.co.ke/caisi-cs-kr105cm-umbrella-beauty-dish-softbox'
      ];

      // URLs that SHOULD NOT be extracted (non-SEO valuable)
      const excludedUrls = [
        'https://ontime.co.ke/?add-to-cart=18294',
        'https://ontime.co.ke/?add-to-cart=18240',
        'https://ontime.co.ke/cart',
        'https://ontime.co.ke/checkout',
        'https://ontime.co.ke/my-account',
        'https://ontime.co.ke/?action=register',
        'https://ontime.co.ke/?s=godox+v1',
        'https://ontime.co.ke/?orderby=price',
        'https://ontime.co.ke/wp-admin',
        'https://ontime.co.ke/wp-json/wp/v2/posts',
        'https://ontime.co.ke/feed',
        'https://ontime.co.ke/sitemap.xml'
      ];

      // Check that expected SEO URLs are included
      expectedSeoUrls.forEach(url => {
        expect(extractedUrls).toContain(url);
      });

      // Check that non-SEO URLs are excluded
      excludedUrls.forEach(url => {
        expect(extractedUrls).not.toContain(url);
      });

      // External URLs should be included if they're valuable
      expect(extractedUrls).toContain('https://facebook.com/ontime');
      expect(extractedUrls).toContain('https://instagram.com/ontime');

      console.log('Extracted SEO URLs:', extractedUrls.length);
      console.log('Expected SEO URLs:', expectedSeoUrls.length);
    });
  });

  describe('getSeoExcludePatterns', () => {
    it('should return patterns that exclude functional URLs', () => {
      const patterns = getSeoExcludePatterns();
      
      expect(patterns).toContain('*add-to-cart*');
      expect(patterns).toContain('*/cart*');
      expect(patterns).toContain('*/checkout*');
      expect(patterns).toContain('*/my-account*');
      expect(patterns).toContain('*/wp-admin*');
      expect(patterns).toContain('*?s=*');
      expect(patterns).toContain('*?orderby=*');
      expect(patterns).toContain('*.pdf');
      expect(patterns).toContain('*.jpg');
    });
  });

  describe('getSeoIncludePatterns', () => {
    it('should return patterns that include content URLs', () => {
      const patterns = getSeoIncludePatterns();
      
      expect(patterns).toContain('*//');
      expect(patterns).toContain('*/about*');
      expect(patterns).toContain('*/contact*');
      expect(patterns).toContain('*/products*');
      expect(patterns).toContain('*/category/*');
      expect(patterns).toContain('*/product/*');
      expect(patterns).toContain('*/brand/*');
    });
  });

  describe('matchesPatterns with SEO patterns', () => {
    it('should correctly match exclude patterns', () => {
      const excludePatterns = getSeoExcludePatterns();
      
      expect(matchesPatterns('https://ontime.co.ke/?add-to-cart=123', excludePatterns)).toBe(true);
      expect(matchesPatterns('https://ontime.co.ke/cart', excludePatterns)).toBe(true);
      expect(matchesPatterns('https://ontime.co.ke/image.jpg', excludePatterns)).toBe(true);
      
      expect(matchesPatterns('https://ontime.co.ke/about', excludePatterns)).toBe(false);
      expect(matchesPatterns('https://ontime.co.ke/product/camera', excludePatterns)).toBe(false);
    });

    it('should correctly match include patterns for specific content types', () => {
      const includePatterns = getSeoIncludePatterns();
      
      // Test specific patterns without the broad root pattern
      expect(matchesPatterns('https://ontime.co.ke/about-us', includePatterns)).toBe(true);
      expect(matchesPatterns('https://ontime.co.ke/product/camera', includePatterns)).toBe(true);
      expect(matchesPatterns('https://ontime.co.ke/brand/canon', includePatterns)).toBe(true);
      expect(matchesPatterns('https://ontime.co.ke/category/electronics', includePatterns)).toBe(true);
      
      // Test that we have specific patterns
      expect(includePatterns.some(p => p.includes('about'))).toBe(true);
      expect(includePatterns.some(p => p.includes('product'))).toBe(true);
      expect(includePatterns.some(p => p.includes('brand'))).toBe(true);
    });
  });

  describe('Edge cases and regression tests', () => {
    it('should handle URLs with fragments and query parameters', () => {
      expect(isSeoValueUrl('https://ontime.co.ke/about#section1')).toBe(true);
      expect(isSeoValueUrl('https://ontime.co.ke/product/camera?ref=homepage')).toBe(true);
      expect(isSeoValueUrl('https://ontime.co.ke/?add-to-cart=123&qty=2')).toBe(false);
    });

    it('should handle case sensitivity', () => {
      expect(isSeoValueUrl('https://ontime.co.ke/ADD-TO-CART')).toBe(false);
      expect(isSeoValueUrl('https://ontime.co.ke/About')).toBe(true);
      expect(isSeoValueUrl('https://ontime.co.ke/PRODUCT/Camera')).toBe(true);
    });

    it('should handle malformed URLs gracefully', () => {
      expect(isSeoValueUrl('not-a-url')).toBe(false);
      expect(isSeoValueUrl('')).toBe(false);
      expect(isSeoValueUrl('javascript:void(0)')).toBe(false);
    });

    it('should prioritize functional exclusions over SEO inclusions', () => {
      // Even if it contains 'product', add-to-cart should be excluded
      expect(isSeoValueUrl('https://ontime.co.ke/product/camera?add-to-cart=123')).toBe(false);
      expect(isSeoValueUrl('https://ontime.co.ke/about-us?action=login')).toBe(false);
    });
  });

  describe('Performance and scalability', () => {
    it('should handle large HTML documents efficiently', () => {
      // Generate a large HTML document with many links
      const links = Array.from({ length: 1000 }, (_, i) => 
        `<a href="/product/${i}">Product ${i}</a>`
      ).join('\n');
      
      const largeHtml = `<html><body>${links}</body></html>`;
      
      const startTime = Date.now();
      const urls = extractSeoUrls(largeHtml, baseUrl);
      const endTime = Date.now();
      
      expect(urls.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('extractDomainVariations', () => {
    describe('Basic Domain Tests', () => {
      it('should extract variations for basic domain', () => {
        const variations = extractDomainVariations('http://example.com');
        
        expect(variations).toContain('example.com');
        expect(variations).toContain('.example.com');
        expect(variations).toContain('www.example.com');
        expect(variations.length).toBeGreaterThanOrEqual(3);
      });

      it('should handle HTTPS protocol', () => {
        const variations = extractDomainVariations('https://example.com');
        
        expect(variations).toContain('example.com');
        expect(variations).toContain('.example.com');
        expect(variations).toContain('www.example.com');
      });

      it('should handle trailing slashes', () => {
        const variations = extractDomainVariations('https://example.com/');
        
        expect(variations).toContain('example.com');
        expect(variations).toContain('.example.com');
        expect(variations).toContain('www.example.com');
      });
    });

    describe('Subdomain Tests', () => {
      it('should extract variations for subdomains', () => {
        const variations = extractDomainVariations('https://blog.example.com');
        
        expect(variations).toContain('example.com');
        expect(variations).toContain('.example.com');
        expect(variations).toContain('www.example.com');
        expect(variations).toContain('blog.example.com');
        expect(variations).toContain('.blog.example.com');
      });

      it('should handle www subdomain specifically', () => {
        const variations = extractDomainVariations('https://www.example.com');
        
        expect(variations).toContain('example.com');
        expect(variations).toContain('.example.com');
        expect(variations).toContain('www.example.com');
        expect(variations).toContain('.www.example.com');
      });

      it('should handle multiple subdomains', () => {
        const variations = extractDomainVariations('https://api.v1.example.com');
        
        expect(variations).toContain('example.com');
        expect(variations).toContain('.example.com');
        expect(variations).toContain('www.example.com');
        expect(variations).toContain('api.v1.example.com');
        expect(variations).toContain('.api.v1.example.com');
        expect(variations).toContain('v1.example.com');
        expect(variations).toContain('.v1.example.com');
      });
    });

    describe('Protocol Normalization Tests', () => {
      it('should normalize mixed case protocols', () => {
        const variations = extractDomainVariations('HtTp://example.com/');
        
        expect(variations).toContain('example.com');
        expect(variations).toContain('.example.com');
        expect(variations).toContain('www.example.com');
      });

      it('should handle protocol-relative URLs', () => {
        const variations = extractDomainVariations('//example.com');
        
        // This should fail gracefully and return empty array
        expect(variations).toEqual([]);
      });
    });

    describe('Effective TLD Tests', () => {
      it('should handle .co.uk domains', () => {
        const variations = extractDomainVariations('https://example.co.uk');
        
        expect(variations).toContain('example.co.uk');
        expect(variations).toContain('.example.co.uk');
        expect(variations).toContain('www.example.co.uk');
      });

      it('should handle .com.au domains', () => {
        const variations = extractDomainVariations('https://example.com.au');
        
        expect(variations).toContain('example.com.au');
        expect(variations).toContain('.example.com.au');
        expect(variations).toContain('www.example.com.au');
      });

      it('should handle .org.uk domains', () => {
        const variations = extractDomainVariations('https://example.org.uk');
        
        expect(variations).toContain('example.org.uk');
        expect(variations).toContain('.example.org.uk');
        expect(variations).toContain('www.example.org.uk');
      });
    });

    describe('Edge Cases', () => {
      it('should return empty array for invalid URLs', () => {
        const variations = extractDomainVariations('invalid-url');
        
        expect(variations).toEqual([]);
      });

      it('should return empty array for empty string', () => {
        const variations = extractDomainVariations('');
        
        expect(variations).toEqual([]);
      });

      it('should handle localhost', () => {
        const variations = extractDomainVariations('http://localhost:3000');
        
        // localhost should return empty array as it doesn't have a public suffix
        expect(variations).toEqual([]);
      });

      it('should handle IP addresses', () => {
        const variations = extractDomainVariations('http://192.168.1.1');
        
        // IP addresses should return empty array as they don't have public suffixes
        expect(variations).toEqual([]);
      });
    });

    describe('Result Consistency', () => {
      it('should return sorted results', () => {
        const variations = extractDomainVariations('https://api.blog.example.com');
        
        // Check if array is sorted
        const sortedVariations = [...variations].sort();
        expect(variations).toEqual(sortedVariations);
      });

      it('should not contain duplicates', () => {
        const variations = extractDomainVariations('https://www.example.com');
        
        const uniqueVariations = [...new Set(variations)];
        expect(variations).toEqual(uniqueVariations);
      });

      it('should handle paths and query parameters', () => {
        const variations = extractDomainVariations('https://example.com/path/to/page?query=value');
        
        expect(variations).toContain('example.com');
        expect(variations).toContain('.example.com');
        expect(variations).toContain('www.example.com');
        // Should not include path or query in domain variations
        expect(variations.every(v => !v.includes('/path'))).toBe(true);
        expect(variations.every(v => !v.includes('?query'))).toBe(true);
      });
    });

    describe('Integration with normalizeUrl', () => {
      it('should work with normalized URLs', () => {
        const normalizedUrl = normalizeUrl('https://example.com/path/?query=value#fragment');
        const variations = extractDomainVariations(normalizedUrl);
        
        expect(variations).toContain('example.com');
        expect(variations).toContain('.example.com');
        expect(variations).toContain('www.example.com');
      });
    });

    describe('Real-world Domain Examples', () => {
      it('should handle Google domains', () => {
        const variations = extractDomainVariations('https://mail.google.com');
        
        expect(variations).toContain('google.com');
        expect(variations).toContain('.google.com');
        expect(variations).toContain('www.google.com');
        expect(variations).toContain('mail.google.com');
        expect(variations).toContain('.mail.google.com');
      });

      it('should handle GitHub domains', () => {
        const variations = extractDomainVariations('https://api.github.com');
        
        expect(variations).toContain('github.com');
        expect(variations).toContain('.github.com');
        expect(variations).toContain('www.github.com');
        expect(variations).toContain('api.github.com');
        expect(variations).toContain('.api.github.com');
      });

      it('should handle complex subdomains', () => {
        const variations = extractDomainVariations('https://staging.api.v2.example.com');
        
        expect(variations).toContain('example.com');
        expect(variations).toContain('.example.com');
        expect(variations).toContain('www.example.com');
        expect(variations).toContain('staging.api.v2.example.com');
        expect(variations).toContain('.staging.api.v2.example.com');
        expect(variations).toContain('api.v2.example.com');
        expect(variations).toContain('.api.v2.example.com');
        expect(variations).toContain('v2.example.com');
        expect(variations).toContain('.v2.example.com');
      });

      it('should handle ontime.co.ke (project domain)', () => {
        const variations = extractDomainVariations('https://ontime.co.ke/cameras');
        
        expect(variations).toContain('ontime.co.ke');
        expect(variations).toContain('.ontime.co.ke');
        expect(variations).toContain('www.ontime.co.ke');
        expect(variations.length).toBe(3);
      });
    });
  });
});
