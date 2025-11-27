import { NextRequest, NextResponse } from 'next/server';

interface SerpRequest {
    keyword: string;
    searchEngine: 'google' | 'bing' | 'yahoo';
}

interface SerpResult {
    keyword: string;
    url: string;
    position: number;
    features: string[];
    snippets: string[];
}

interface SerpResponse {
    keyword: string;
    results: SerpResult[];
    searchEngine: string;
    totalResults: number;
    resultCountByPosition: number[];
    organicTop3Results: number;
}

// Mock SERP features that can appear
const SERP_FEATURES = [
    'Meta Description',
    'Featured Snippet',
    'Rich Snippet',
    'Site Links',
    'Image Pack',
    'Video Results',
    'People Also Ask',
    'Knowledge Panel',
    'Local Pack',
    'Reviews',
];

// Generate realistic domain names
const MOCK_DOMAINS = [
    'wikipedia.org',
    'medium.com',
    'forbes.com',
    'hubspot.com',
    'moz.com',
    'searchenginejournal.com',
    'neilpatel.com',
    'backlinko.com',
    'semrush.com',
    'ahrefs.com',
];

// Generate mock snippet text
function generateSnippet(keyword: string): string {
    const snippets = [
        `Learn everything about ${keyword} with our comprehensive guide. Discover tips, strategies, and best practices.`,
        `The ultimate ${keyword} resource for beginners and experts. Get started today with our step-by-step tutorials.`,
        `${keyword} - What you need to know in 2025. Expert insights and actionable advice.`,
        `Best practices for ${keyword}. Updated strategies and proven techniques.`,
        `Master ${keyword} with our in-depth articles and case studies.`,
    ];
    return snippets[Math.floor(Math.random() * snippets.length)];
}

// Generate random SERP features for a result
function generateFeatures(): string[] {
    const numFeatures = Math.floor(Math.random() * 3) + 1; // 1-3 features
    const shuffled = [...SERP_FEATURES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numFeatures);
}

export async function POST(request: NextRequest) {
    try {
        const body: SerpRequest = await request.json();

        // Validate request
        if (!body.keyword || !body.keyword.trim()) {
            return NextResponse.json(
                { error: 'Keyword is required.' },
                { status: 400 }
            );
        }

        if (!['google', 'bing', 'yahoo'].includes(body.searchEngine)) {
            return NextResponse.json(
                { error: 'Invalid search engine. Must be google, bing, or yahoo.' },
                { status: 400 }
            );
        }

        // Simulate API processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const keyword = body.keyword.trim();

        // Generate 10 mock results
        const results: SerpResult[] = Array.from({ length: 10 }, (_, index) => {
            const position = index + 1;
            const domain = MOCK_DOMAINS[index % MOCK_DOMAINS.length];
            const slug = keyword.toLowerCase().replace(/\s+/g, '-');

            return {
                keyword,
                url: `https://${domain}/${slug}`,
                position,
                features: generateFeatures(),
                snippets: [generateSnippet(keyword)],
            };
        });

        // Calculate statistics
        const totalResults = Math.floor(Math.random() * 1000000) + 100000; // 100k-1.1M results
        const organicTop3Results = 3; // Always 3 for top 3
        const resultCountByPosition = results.map(r => r.position);

        const response: SerpResponse = {
            keyword,
            results,
            searchEngine: body.searchEngine,
            totalResults,
            resultCountByPosition,
            organicTop3Results,
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('SERP Analyzer API error:', error);
        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        );
    }
}
