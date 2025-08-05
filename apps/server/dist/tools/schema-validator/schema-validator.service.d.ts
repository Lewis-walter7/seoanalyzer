import { ValidateSchemaDto, SchemaValidationResult } from './dto/schema-validation.dto';
export declare class SchemaValidatorService {
    validateSchemas(dto: ValidateSchemaDto): Promise<SchemaValidationResult>;
    private extractJsonLd;
    private extractMicrodata;
    private extractRdfa;
    private parseMicrodataElement;
    private parseRdfaElement;
    private validateSchema;
    private validateArticle;
    private validateProduct;
    private validateLocalBusiness;
    private validateRecipe;
    private validateFAQ;
    private validateHowTo;
    private checkRequiredFields;
    private checkRecommendedFields;
    private generateRichSnippetPreviews;
    private createRichSnippetPreview;
    private formatAddress;
    private generateRecommendations;
}
