export declare const exampleSerpAnalysisRequest: {
    keyword: string;
    serpData: {
        results: ({
            title: string;
            url: string;
            description: string;
            isAd: boolean;
            rating: number;
            date: string;
            author: string;
            images: string[];
            price?: undefined;
            sitelinks?: undefined;
        } | {
            title: string;
            url: string;
            description: string;
            isAd: boolean;
            price: string;
            rating?: undefined;
            date?: undefined;
            author?: undefined;
            images?: undefined;
            sitelinks?: undefined;
        } | {
            title: string;
            url: string;
            description: string;
            isAd: boolean;
            rating: number;
            sitelinks: {
                title: string;
                url: string;
            }[];
            date?: undefined;
            author?: undefined;
            images?: undefined;
            price?: undefined;
        })[];
        featuredSnippet: {
            title: string;
            content: string;
            url: string;
        };
        peopleAlsoAsk: {
            questions: string[];
            position: number;
        };
        relatedSearches: string[];
    };
    searchEngine: string;
    location: string;
    device: string;
    projectId: string;
};
