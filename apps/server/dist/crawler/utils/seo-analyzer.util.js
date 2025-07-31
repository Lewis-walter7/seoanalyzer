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
            // Overall scores (placeholder - could be calculated based on other metrics)
            seoScore: undefined,
            performanceScore: undefined,
            accessibilityScore: undefined,
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
}
exports.SeoAnalyzer = SeoAnalyzer;
