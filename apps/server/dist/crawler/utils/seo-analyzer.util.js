"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoAnalyzer = void 0;
class SeoAnalyzer {
    analyzeHtml(html, url) {
        const title = this.extractTagContent(html, 'title');
        const metaDescription = this.extractMetaContent(html, 'description');
        const canonical = this.extractCanonicalUrl(html);
        const robotsMeta = this.extractMetaContent(html, 'robots');
        const h1Tags = this.extractTagContents(html, 'h1');
        const langAttribute = this.extractLangAttribute(html);
        // Count heading tags
        const h1Count = this.countTags(html, 'h1');
        const h2Count = this.countTags(html, 'h2');
        const h3Count = this.countTags(html, 'h3');
        const h4Count = this.countTags(html, 'h4');
        const h5Count = this.countTags(html, 'h5');
        const h6Count = this.countTags(html, 'h6');
        // Image analysis
        const imageAnalysis = this.analyzeImages(html);
        // Link analysis
        const linkAnalysis = this.analyzeLinks(html, url);
        // Schema.org analysis
        const schemaAnalysis = this.analyzeStructuredData(html);
        // Social media analysis
        const socialAnalysis = this.analyzeSocialMeta(html);
        // Technical SEO checks
        const technicalAnalysis = this.analyzeTechnicalSeo(html, url);
        return {
            // Title metrics
            titleTag: title || undefined,
            titleLength: title ? title.length : undefined,
            titleExists: !!title,
            titleTooLong: title ? title.length > 60 : false,
            titleTooShort: title ? title.length < 30 : false,
            // Meta description metrics
            metaDescription: metaDescription || undefined,
            metaDescriptionLength: metaDescription ? metaDescription.length : undefined,
            metaDescriptionExists: !!metaDescription,
            metaDescriptionTooLong: metaDescription ? metaDescription.length > 160 : false,
            metaDescriptionTooShort: metaDescription ? metaDescription.length < 120 : false,
            // Heading metrics
            h1Count,
            h1Tags,
            h2Count,
            h3Count,
            h4Count,
            h5Count,
            h6Count,
            hasMultipleH1: h1Count > 1,
            missingH1: h1Count === 0,
            // Canonical and robots
            canonicalUrl: canonical || undefined,
            hasCanonical: !!canonical,
            robotsContent: robotsMeta || undefined,
            hasRobotsMeta: !!robotsMeta,
            isIndexable: !robotsMeta || !robotsMeta.toLowerCase().includes('noindex'),
            isFollowable: !robotsMeta || !robotsMeta.toLowerCase().includes('nofollow'),
            // Schema.org structured data
            hasSchemaOrg: schemaAnalysis.hasSchemaOrg,
            schemaOrgTypes: schemaAnalysis.schemaOrgTypes,
            jsonLdCount: schemaAnalysis.jsonLdCount,
            microdataCount: schemaAnalysis.microdataCount,
            rdfaCount: schemaAnalysis.rdfaCount,
            // Images
            totalImages: imageAnalysis.totalImages,
            imagesWithoutAlt: imageAnalysis.imagesWithoutAlt,
            imagesWithAlt: imageAnalysis.imagesWithAlt,
            imagesWithoutTitle: imageAnalysis.imagesWithoutTitle,
            imagesOptimized: imageAnalysis.imagesOptimized,
            // Links
            internalLinksCount: linkAnalysis.internalLinksCount,
            externalLinksCount: linkAnalysis.externalLinksCount,
            brokenLinksCount: linkAnalysis.brokenLinksCount,
            noFollowLinksCount: linkAnalysis.noFollowLinksCount,
            internalLinks: linkAnalysis.internalLinks,
            externalLinks: linkAnalysis.externalLinks,
            brokenLinks: linkAnalysis.brokenLinks,
            // Content metrics
            wordCount: this.countWords(html),
            contentRatio: this.calculateContentRatio(html),
            hasValidLang: !!langAttribute,
            languageCode: langAttribute || undefined,
            // Social media
            hasOpenGraph: socialAnalysis.hasOpenGraph,
            hasTwitterCard: socialAnalysis.hasTwitterCard,
            // Technical SEO
            hasViewport: technicalAnalysis.hasViewport,
            hasCharset: technicalAnalysis.hasCharset,
            isHttps: technicalAnalysis.isHttps,
            hasSitemapReference: technicalAnalysis.hasSitemapReference,
            // Performance metrics (will be set from crawler data)
            loadTime: undefined,
            pageSize: html.length,
            // Overall scores (calculated based on other metrics)
            seoScore: this.calculateSeoScore(title, metaDescription, h1Count, linkAnalysis, imageAnalysis, technicalAnalysis),
            performanceScore: this.calculatePerformanceScore(html.length, undefined), // loadTime passed separately
            accessibilityScore: this.calculateAccessibilityScore(imageAnalysis, langAttribute, technicalAnalysis),
            // Initialize issues array
            issues: [],
        };
    }
    extractTagContent(html, tag) {
        const regex = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'i');
        const match = html.match(regex);
        return match ? match[1].trim() : null;
    }
    // Public method for testing
    extractTagContentPublic(html, tag) {
        return this.extractTagContent(html, tag);
    }
    extractTagContents(html, tag) {
        const regex = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'gi');
        const matches = html.match(regex);
        return matches ? matches.map(match => match.replace(/<[^>]*>/g, '').trim()) : [];
    }
    extractMetaContent(html, name) {
        const regex = new RegExp(`<meta[^>]+name=['"]${name}['"][^>]*content=['"]([^'"]*)['"][^>]*>`, 'i');
        const match = html.match(regex);
        return match ? match[1].trim() : null;
    }
    extractCanonicalUrl(html) {
        const regex = /<link[^>]+rel=['"]canonical['"][^>]*href=['"]([^'"]*)['"][^>]*>/i;
        const match = html.match(regex);
        return match ? match[1].trim() : null;
    }
    extractLangAttribute(html) {
        const regex = /<html[^>]+lang=['"]([^'"]*)['"][^>]*>/i;
        const match = html.match(regex);
        return match ? match[1].trim() : null;
    }
    countTags(html, tag) {
        const regex = new RegExp(`<${tag}[^>]*>`, 'gi');
        const matches = html.match(regex);
        return matches ? matches.length : 0;
    }
    analyzeImages(html) {
        const imgTags = html.match(/<img[^>]*>/gi) || [];
        const totalImages = imgTags.length;
        let imagesWithoutAlt = 0;
        let imagesWithoutTitle = 0;
        imgTags.forEach(img => {
            if (!img.match(/alt=['"][^'"]*['"]/i) || img.match(/alt=['"]['"]/) || img.match(/alt=['"]\s*['"]/)) {
                imagesWithoutAlt++;
            }
            if (!img.match(/title=['"][^'"]*['"]/i)) {
                imagesWithoutTitle++;
            }
        });
        return {
            totalImages,
            imagesWithoutAlt,
            imagesWithAlt: totalImages - imagesWithoutAlt,
            imagesWithoutTitle,
            imagesOptimized: imagesWithoutAlt === 0, // Simple optimization check
        };
    }
    analyzeLinks(html, url) {
        const linkTags = html.match(/<a[^>]*href=['"][^'"]*['"][^>]*>/gi) || [];
        const links = linkTags.map(link => {
            const hrefMatch = link.match(/href=['"]([^'"]*)['"]/);
            return hrefMatch ? hrefMatch[1] : '';
        }).filter(Boolean);
        const domain = url ? new URL(url).hostname : '';
        const internalLinks = [];
        const externalLinks = [];
        let noFollowLinksCount = 0;
        linkTags.forEach(link => {
            const hrefMatch = link.match(/href=['"]([^'"]*)['"]/);
            if (hrefMatch) {
                const href = hrefMatch[1];
                try {
                    const linkUrl = new URL(href, url);
                    if (linkUrl.hostname === domain) {
                        internalLinks.push(href);
                    }
                    else {
                        externalLinks.push(href);
                    }
                }
                catch {
                    // Invalid URL, treat as internal
                    internalLinks.push(href);
                }
            }
            if (link.match(/rel=['"]nofollow['"]/) || link.match(/rel=['"].*\bnofollow\b.*['"]/)) {
                noFollowLinksCount++;
            }
        });
        return {
            internalLinksCount: internalLinks.length,
            externalLinksCount: externalLinks.length,
            brokenLinksCount: 0, // Would require actual HTTP checks
            noFollowLinksCount,
            internalLinks,
            externalLinks,
            brokenLinks: [], // Would require actual HTTP checks
        };
    }
    analyzeStructuredData(html) {
        const jsonLdMatches = html.match(/<script[^>]*type=['"]application\/ld\+json['"][^>]*>[\s\S]*?<\/script>/gi) || [];
        const microdataMatches = html.match(/itemscope|itemprop|itemtype/gi) || [];
        const rdfaMatches = html.match(/property=['"]|typeof=['"]|resource=['"]/gi) || [];
        const schemaOrgTypes = [];
        jsonLdMatches.forEach(script => {
            const typeMatch = script.match(/['"]@type['"]\s*:\s*['"]([^'"]*)['"]/);
            if (typeMatch) {
                schemaOrgTypes.push(typeMatch[1]);
            }
        });
        return {
            hasSchemaOrg: jsonLdMatches.length > 0 || microdataMatches.length > 0 || rdfaMatches.length > 0,
            schemaOrgTypes,
            jsonLdCount: jsonLdMatches.length,
            microdataCount: microdataMatches.length,
            rdfaCount: rdfaMatches.length,
        };
    }
    analyzeSocialMeta(html) {
        const ogTags = html.match(/<meta[^>]*property=['"]og:[^'"]*['"][^>]*>/gi) || [];
        const twitterTags = html.match(/<meta[^>]*name=['"]twitter:[^'"]*['"][^>]*>/gi) || [];
        return {
            hasOpenGraph: ogTags.length > 0,
            hasTwitterCard: twitterTags.length > 0,
        };
    }
    analyzeTechnicalSeo(html, url) {
        const hasViewport = !!/<meta[^>]*name=['"]viewport['"][^>]*>/i.test(html);
        const hasCharset = !!/<meta[^>]*charset[^>]*>/i.test(html) || !!/<meta[^>]*http-equiv=['"]content-type['"][^>]*>/i.test(html);
        const isHttps = url ? url.startsWith('https://') : false;
        const hasSitemapReference = !!/sitemap/i.test(html);
        return {
            hasViewport,
            hasCharset,
            isHttps,
            hasSitemapReference,
        };
    }
    countWords(html) {
        const textContent = html.replace(/<[^>]*>/g, ' ');
        const words = textContent.match(/\b\w+\b/g);
        return words ? words.length : 0;
    }
    calculateContentRatio(html) {
        const textContent = html.replace(/<[^>]*>/g, '');
        const textLength = textContent.length;
        const htmlLength = html.length;
        return htmlLength > 0 ? textLength / htmlLength : 0;
    }
    /**
     * Calculate SEO score based on various SEO factors (0-100)
     */
    calculateSeoScore(title, metaDescription, h1Count, linkAnalysis, imageAnalysis, technicalAnalysis) {
        let score = 0;
        let maxScore = 0;
        // Title tag (20 points)
        maxScore += 20;
        if (title) {
            if (title.length >= 30 && title.length <= 60) {
                score += 20;
            }
            else if (title.length > 0) {
                score += 10;
            }
        }
        // Meta description (15 points)
        maxScore += 15;
        if (metaDescription) {
            if (metaDescription.length >= 120 && metaDescription.length <= 160) {
                score += 15;
            }
            else if (metaDescription.length > 0) {
                score += 8;
            }
        }
        // H1 tag (15 points)
        maxScore += 15;
        if (h1Count === 1) {
            score += 15;
        }
        else if (h1Count && h1Count > 1) {
            score += 5;
        }
        // Images optimization (10 points)
        maxScore += 10;
        if (imageAnalysis) {
            if (imageAnalysis.totalImages === 0) {
                score += 10; // No images to optimize
            }
            else {
                const altRatio = imageAnalysis.imagesWithAlt / imageAnalysis.totalImages;
                score += Math.round(altRatio * 10);
            }
        }
        // Technical SEO (25 points)
        maxScore += 25;
        if (technicalAnalysis) {
            if (technicalAnalysis.hasViewport)
                score += 5;
            if (technicalAnalysis.hasCharset)
                score += 5;
            if (technicalAnalysis.isHttps)
                score += 10;
            if (technicalAnalysis.hasSitemapReference)
                score += 5;
        }
        // Link structure (15 points)
        maxScore += 15;
        if (linkAnalysis) {
            const totalLinks = linkAnalysis.internalLinksCount + linkAnalysis.externalLinksCount;
            if (totalLinks > 0) {
                if (linkAnalysis.internalLinksCount > 0)
                    score += 8;
                if (linkAnalysis.externalLinksCount > 0 && linkAnalysis.externalLinksCount <= 10)
                    score += 7;
            }
        }
        return Math.round((score / maxScore) * 100);
    }
    /**
     * Calculate performance score based on load time and page size (0-100)
     */
    calculatePerformanceScore(pageSize, loadTime) {
        let score = 100;
        // Page size scoring (50% of total score)
        if (pageSize) {
            if (pageSize > 3 * 1024 * 1024) { // 3MB+
                score -= 25;
            }
            else if (pageSize > 1.5 * 1024 * 1024) { // 1.5MB+
                score -= 15;
            }
            else if (pageSize > 1024 * 1024) { // 1MB+
                score -= 10;
            }
            else if (pageSize > 500 * 1024) { // 500KB+
                score -= 5;
            }
        }
        // Load time scoring (50% of total score)
        if (loadTime) {
            if (loadTime > 5000) { // 5s+
                score -= 25;
            }
            else if (loadTime > 3000) { // 3s+
                score -= 15;
            }
            else if (loadTime > 2000) { // 2s+
                score -= 10;
            }
            else if (loadTime > 1000) { // 1s+
                score -= 5;
            }
        }
        return Math.max(0, score);
    }
    /**
     * Calculate accessibility score based on various accessibility factors (0-100)
     */
    calculateAccessibilityScore(imageAnalysis, langAttribute, technicalAnalysis) {
        let score = 0;
        let maxScore = 0;
        // Alt text for images (40 points)
        maxScore += 40;
        if (imageAnalysis) {
            if (imageAnalysis.totalImages === 0) {
                score += 40; // No images to check
            }
            else {
                const altRatio = imageAnalysis.imagesWithAlt / imageAnalysis.totalImages;
                score += Math.round(altRatio * 40);
            }
        }
        // Language attribute (30 points)
        maxScore += 30;
        if (langAttribute) {
            score += 30;
        }
        // Viewport meta tag (20 points)
        maxScore += 20;
        if (technicalAnalysis && technicalAnalysis.hasViewport) {
            score += 20;
        }
        // Character encoding (10 points)
        maxScore += 10;
        if (technicalAnalysis && technicalAnalysis.hasCharset) {
            score += 10;
        }
        return Math.round((score / maxScore) * 100);
    }
    /**
     * Update performance score with actual load time data
     */
    updatePerformanceScore(auditData, loadTime) {
        return {
            ...auditData,
            loadTime,
            performanceScore: this.calculatePerformanceScore(auditData.pageSize, loadTime)
        };
    }
}
exports.SeoAnalyzer = SeoAnalyzer;
