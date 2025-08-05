import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SerpAnalysisDto, SerpResult, SerpFeature, ContentDetail } from './dto/serp-analysis.dto';

@Injectable()
export class SerpAnalyzerService {
  constructor(private readonly prisma: PrismaService) {}

  async analyze(userId: string, serpAnalysisDto: SerpAnalysisDto) {
    const { keyword, serpData, searchEngine = 'GOOGLE', location = 'Global', device = 'DESKTOP' } = serpAnalysisDto;

    try {
      // Parse the SERP data
      const parsedResults = this.parseSerpData(serpData);
      
      // Extract features and ranking positions
      const features = this.extractSerpFeatures(serpData);
      
      // Analyze content details
      const contentAnalysis = this.analyzeContentDetails(parsedResults);
      
      // Create the analysis result
      const analysisResult = {
        id: this.generateAnalysisId(),
        userId,
        keyword,
        searchEngine,
        location,
        device,
        timestamp: new Date(),
        totalResults: parsedResults.length,
        organicResults: parsedResults.filter(r => r.type === 'organic'),
        paidResults: parsedResults.filter(r => r.type === 'paid'),
        features,
        contentAnalysis,
        results: parsedResults,
      };

      // Store the analysis result (if needed for persistence)
      await this.storeAnalysisResult(analysisResult);

      return analysisResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`SERP analysis failed: ${errorMessage}`);
    }
  }

  private parseSerpData(serpData: any): SerpResult[] {
    if (!serpData || !Array.isArray(serpData.results)) {
      return [];
    }

    return serpData.results.map((result: any, index: number) => ({
      position: index + 1,
      title: result.title || '',
      url: result.url || result.link || '',
      description: result.description || result.snippet || '',
      displayUrl: this.extractDisplayUrl(result.url || result.link || ''),
      type: this.determineResultType(result),
      features: this.extractResultFeatures(result),
      metadata: {
        hasImages: Boolean(result.images || result.thumbnail),
        hasVideo: Boolean(result.video),
        hasRichSnippet: Boolean(result.richSnippet || result.structuredData),
        datePublished: result.date || null,
        author: result.author || null,
        rating: result.rating || null,
        price: result.price || null,
      },
    }));
  }

  private extractSerpFeatures(serpData: any): SerpFeature[] {
    const features: SerpFeature[] = [];

    // Check for common SERP features
    if (serpData.knowledgeGraph) {
      features.push({
        type: 'knowledge_graph',
        position: 1,
        content: serpData.knowledgeGraph,
      });
    }

    if (serpData.featuredSnippet) {
      features.push({
        type: 'featured_snippet',
        position: 0, // Featured snippets are typically at position 0
        content: serpData.featuredSnippet,
      });
    }

    if (serpData.localPack) {
      features.push({
        type: 'local_pack',
        position: serpData.localPack.position || 1,
        content: serpData.localPack,
      });
    }

    if (serpData.peopleAlsoAsk) {
      features.push({
        type: 'people_also_ask',
        position: serpData.peopleAlsoAsk.position || 2,
        content: serpData.peopleAlsoAsk,
      });
    }

    if (serpData.relatedSearches) {
      features.push({
        type: 'related_searches',
        position: 999, // Usually at the bottom
        content: serpData.relatedSearches,
      });
    }

    if (serpData.shopping) {
      features.push({
        type: 'shopping_results',
        position: serpData.shopping.position || 1,
        content: serpData.shopping,
      });
    }

    return features.sort((a, b) => a.position - b.position);
  }

  private analyzeContentDetails(results: SerpResult[]): ContentDetail {
    const titleLengths = results.map(r => r.title.length).filter(l => l > 0);
    const descriptionLengths = results.map(r => r.description.length).filter(l => l > 0);
    
    const domains = results.map(r => this.extractDomain(r.url)).filter(Boolean);
    const uniqueDomains = [...new Set(domains)];
    
    const topDomains = this.getTopDomains(domains);
    
    return {
      averageTitleLength: titleLengths.length > 0 ? Math.round(titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length) : 0,
      averageDescriptionLength: descriptionLengths.length > 0 ? Math.round(descriptionLengths.reduce((a, b) => a + b, 0) / descriptionLengths.length) : 0,
      totalDomains: uniqueDomains.length,
      topDomains,
      hasRichSnippets: results.some(r => r.metadata.hasRichSnippet),
      hasImages: results.some(r => r.metadata.hasImages),
      hasVideos: results.some(r => r.metadata.hasVideo),
      competitionLevel: this.calculateCompetitionLevel(uniqueDomains, results),
    };
  }

  private determineResultType(result: any): 'organic' | 'paid' | 'local' | 'shopping' | 'news' | 'image' | 'video' {
    if (result.isAd || result.ad) return 'paid';
    if (result.local || result.localBusiness) return 'local';
    if (result.shopping || result.price) return 'shopping';
    if (result.news || result.newsSource) return 'news';
    if (result.image || result.thumbnail) return 'image';
    if (result.video || result.videoUrl) return 'video';
    return 'organic';
  }

  private extractResultFeatures(result: any): string[] {
    const features: string[] = [];
    
    if (result.richSnippet) features.push('rich_snippet');
    if (result.sitelinks) features.push('sitelinks');
    if (result.images) features.push('images');
    if (result.video) features.push('video');
    if (result.rating) features.push('rating');
    if (result.price) features.push('price');
    if (result.date) features.push('date');
    if (result.author) features.push('author');
    
    return features;
  }

  private extractDisplayUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  private getTopDomains(domains: string[]): Array<{ domain: string; count: number; percentage: number }> {
    const domainCount = domains.reduce((acc, domain) => {
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = domains.length;
    return Object.entries(domainCount)
      .map(([domain, count]) => ({
        domain,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 domains
  }

  private calculateCompetitionLevel(uniqueDomains: string[], results: SerpResult[]): 'low' | 'medium' | 'high' {
    const domainDiversity = uniqueDomains.length / results.length;
    const hasRichFeatures = results.some(r => r.features.length > 0);
    const hasPaidResults = results.some(r => r.type === 'paid');
    
    if (domainDiversity > 0.8 && hasRichFeatures && hasPaidResults) return 'high';
    if (domainDiversity > 0.6 || hasRichFeatures || hasPaidResults) return 'medium';
    return 'low';
  }

  private generateAnalysisId(): string {
    return `serp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async storeAnalysisResult(result: any): Promise<void> {
    // Store the analysis result in the database if needed
    // This could be implemented based on your Prisma schema
    try {
      // Example: await this.prisma.serpAnalysis.create({ data: result });
      console.log('SERP analysis result stored for user:', result.userId);
    } catch (error) {
      console.error('Failed to store SERP analysis result:', error);
    }
  }

  async getAnalysisHistory(userId: string, limit: number = 10, offset: number = 0) {
    // Retrieve analysis history for a user
    // This would be implemented based on your Prisma schema
    try {
      // Example implementation:
      // return await this.prisma.serpAnalysis.findMany({
      //   where: { userId },
      //   take: limit,
      //   skip: offset,
      //   orderBy: { timestamp: 'desc' }
      // });
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to retrieve analysis history: ${errorMessage}`);
    }
  }
}
