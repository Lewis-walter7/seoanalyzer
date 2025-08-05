export declare enum SchemaType {
    JSON_LD = "json-ld",
    MICRODATA = "microdata",
    RDFA = "rdfa",
    ALL = "all"
}
export declare class ValidateSchemaDto {
    url: string;
    schemaType?: SchemaType;
}
export interface SchemaValidationError {
    type: 'error' | 'warning';
    message: string;
    line?: number;
    property?: string;
    value?: any;
}
export interface ParsedSchema {
    type: string;
    data: any;
    format: SchemaType;
    errors: SchemaValidationError[];
    warnings: SchemaValidationError[];
}
export interface RichSnippetPreview {
    type: string;
    title?: string;
    description?: string;
    image?: string;
    price?: string;
    rating?: number;
    reviewCount?: number;
    author?: string;
    publishDate?: string;
    breadcrumbs?: string[];
    organization?: {
        name: string;
        logo?: string;
        address?: string;
        phone?: string;
    };
    localBusiness?: {
        name: string;
        address: string;
        phone: string;
        hours: string;
        rating?: number;
    };
    recipe?: {
        name: string;
        image: string;
        prepTime: string;
        cookTime: string;
        totalTime: string;
        recipeYield: string;
        nutrition?: any;
    };
    faq?: Array<{
        question: string;
        answer: string;
    }>;
    howTo?: {
        name: string;
        steps: Array<{
            name: string;
            text: string;
            image?: string;
        }>;
    };
}
export interface SchemaValidationResult {
    url: string;
    schemas: ParsedSchema[];
    richSnippets: RichSnippetPreview[];
    summary: {
        totalSchemas: number;
        validSchemas: number;
        errorCount: number;
        warningCount: number;
        schemaTypes: string[];
    };
    recommendations: string[];
    validatedAt: Date;
}
