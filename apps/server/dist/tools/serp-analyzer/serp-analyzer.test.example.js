"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exampleSerpAnalysisRequest = void 0;
const testing_1 = require("@nestjs/testing");
const serp_analyzer_service_1 = require("./serp-analyzer.service");
const prisma_service_1 = require("../../prisma/prisma.service");
describe('SerpAnalyzerService', () => {
    let service;
    let prisma;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                serp_analyzer_service_1.SerpAnalyzerService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: {
                    // Mock PrismaService methods as needed
                    },
                },
            ],
        }).compile();
        service = module.get(serp_analyzer_service_1.SerpAnalyzerService);
        prisma = module.get(prisma_service_1.PrismaService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should analyze SERP data correctly', async () => {
        const mockSerpData = {
            results: [
                {
                    title: 'Example Title 1',
                    url: 'https://example1.com',
                    description: 'This is an example description for the first result.',
                    isAd: false,
                },
                {
                    title: 'Example Title 2',
                    url: 'https://example2.com',
                    description: 'This is an example description for the second result.',
                    isAd: true,
                },
            ],
            featuredSnippet: {
                title: 'Featured Snippet Title',
                content: 'Featured snippet content',
            },
            knowledgeGraph: {
                title: 'Knowledge Graph Title',
                content: 'Knowledge graph content',
            },
        };
        const analysisDto = {
            keyword: 'test keyword',
            serpData: mockSerpData,
            searchEngine: 'GOOGLE',
            location: 'United States',
            device: 'DESKTOP',
        };
        const result = await service.analyze('test-user-id', analysisDto);
        expect(result).toBeDefined();
        expect(result.keyword).toBe('test keyword');
        expect(result.totalResults).toBe(2);
        expect(result.organicResults).toHaveLength(1);
        expect(result.paidResults).toHaveLength(1);
        expect(result.features).toHaveLength(2); // featured snippet + knowledge graph
        expect(result.contentAnalysis).toBeDefined();
        expect(result.contentAnalysis.totalDomains).toBe(2);
    });
});
// Example usage:
exports.exampleSerpAnalysisRequest = {
    keyword: 'best seo tools 2024',
    serpData: {
        results: [
            {
                title: 'Top 10 SEO Tools for 2024 - Complete Guide',
                url: 'https://seoexpert.com/best-seo-tools-2024',
                description: 'Discover the best SEO tools for 2024 including free and paid options. Our comprehensive guide covers keyword research, rank tracking, and more.',
                isAd: false,
                rating: 4.8,
                date: '2024-01-15',
                author: 'SEO Expert Team',
                images: ['https://seoexpert.com/images/seo-tools.jpg'],
            },
            {
                title: 'Professional SEO Tools - Start Free Trial',
                url: 'https://serpanalyzer.com/tools',
                description: 'Get started with our professional SEO toolkit. Track rankings, analyze competitors, and boost your search visibility.',
                isAd: true,
                price: '$29.99/month',
            },
            {
                title: 'SEMrush: All-in-One Marketing Toolkit',
                url: 'https://semrush.com',
                description: 'SEMrush is a comprehensive digital marketing suite with SEO, PPC, content, social media, and competitive research tools.',
                isAd: false,
                rating: 4.7,
                sitelinks: [
                    { title: 'Keyword Research', url: 'https://semrush.com/features/keyword-research' },
                    { title: 'Site Audit', url: 'https://semrush.com/features/site-audit' },
                ],
            },
        ],
        featuredSnippet: {
            title: 'What are the best SEO tools?',
            content: 'The best SEO tools include Google Analytics, SEMrush, Ahrefs, Moz, and Screaming Frog. These tools help with keyword research, site audits, backlink analysis, and rank tracking.',
            url: 'https://marketingguide.com/seo-tools',
        },
        peopleAlsoAsk: {
            questions: [
                'What are free SEO tools?',
                'How much do SEO tools cost?',
                'Which SEO tool is best for beginners?',
                'Do I need paid SEO tools?',
            ],
            position: 3,
        },
        relatedSearches: [
            'free seo tools',
            'seo tools comparison',
            'best seo software',
            'seo analysis tools',
        ],
    },
    searchEngine: 'GOOGLE',
    location: 'United States',
    device: 'DESKTOP',
    projectId: 'project-123',
};
