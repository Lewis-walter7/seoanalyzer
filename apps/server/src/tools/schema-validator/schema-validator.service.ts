import { Injectable } from '@nestjs/common';
import { ValidateSchemaDto, ParsedSchema, SchemaValidationResult, SchemaType, RichSnippetPreview, SchemaValidationError } from './dto/schema-validation.dto';
import { JSDOM } from 'jsdom';

@Injectable()
export class SchemaValidatorService {
  async validateSchemas(dto: ValidateSchemaDto): Promise<SchemaValidationResult> {
    const { url, schemaType } = dto;

    try {
      // Fetch the page HTML
      const response = await fetch(url);
      const html = await response.text();

      // Use JSDOM to parse HTML content
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const schemas: ParsedSchema[] = [];

      // Extract JSON-LD
      if (schemaType === SchemaType.JSON_LD || schemaType === SchemaType.ALL) {
        const jsonLdSchemas = this.extractJsonLd(document);
        schemas.push(...jsonLdSchemas);
      }

      // Extract Microdata
      if (schemaType === SchemaType.MICRODATA || schemaType === SchemaType.ALL) {
        const microdataSchemas = this.extractMicrodata(document);
        schemas.push(...microdataSchemas);
      }

      // Extract RDFa
      if (schemaType === SchemaType.RDFA || schemaType === SchemaType.ALL) {
        const rdfaSchemas = this.extractRdfa(document);
        schemas.push(...rdfaSchemas);
      }

      // Validate each schema
      schemas.forEach(schema => {
        this.validateSchema(schema);
      });

      // Generate rich snippet previews
      const richSnippets = this.generateRichSnippetPreviews(schemas);

      // Generate recommendations
      const recommendations = this.generateRecommendations(schemas, document);

      return {
        url,
        schemas,
        richSnippets,
        summary: {
          totalSchemas: schemas.length,
          validSchemas: schemas.filter((s) => s.errors.length === 0).length,
          errorCount: schemas.reduce((acc, s) => acc + s.errors.length, 0),
          warningCount: schemas.reduce((acc, s) => acc + s.warnings.length, 0),
          schemaTypes: [...new Set(schemas.map((s) => s.format))],
        },
        recommendations,
        validatedAt: new Date(),
      };
    } catch (error: any) {
      throw new Error(`Failed to validate schemas: ${error?.message || 'Unknown error'}`);
    }
  }

  private extractJsonLd(document: Document): ParsedSchema[] {
    const schemas: ParsedSchema[] = [];
    const jsonLdElements = document.querySelectorAll('script[type="application/ld+json"]');
    
    jsonLdElements.forEach((element: any, index) => {
      try {
        const jsonText = element.textContent || '{}';
        const data = JSON.parse(jsonText);
        
        // Handle arrays of schema objects
        const schemaArray = Array.isArray(data) ? data : [data];
        
        schemaArray.forEach((schemaData, subIndex) => {
          schemas.push({
            type: schemaData['@type'] || 'Unknown',
            data: schemaData,
            format: SchemaType.JSON_LD,
            errors: [],
            warnings: [],
          });
        });
      } catch (error: any) {
        schemas.push({
          type: 'JSON-LD',
          data: {},
          format: SchemaType.JSON_LD,
          errors: [{ type: 'error', message: `Invalid JSON-LD syntax: ${error?.message || 'Unknown error'}`, line: index + 1 }],
          warnings: [],
        });
      }
    });
    
    return schemas;
  }

  private extractMicrodata(document: Document): ParsedSchema[] {
    const schemas: ParsedSchema[] = [];
    const microdataElements = document.querySelectorAll('[itemscope]');
    
    microdataElements.forEach((element: Element) => {
      try {
        const itemType = element.getAttribute('itemtype') || 'Unknown';
        const data = this.parseMicrodataElement(element);
        
        schemas.push({
          type: itemType.split('/').pop() || 'Unknown',
          data,
          format: SchemaType.MICRODATA,
          errors: [],
          warnings: [],
        });
      } catch (error: any) {
        schemas.push({
          type: 'Microdata',
          data: {},
          format: SchemaType.MICRODATA,
          errors: [{ type: 'error', message: `Error parsing Microdata: ${error?.message || 'Unknown error'}` }],
          warnings: [],
        });
      }
    });
    
    return schemas;
  }

  private extractRdfa(document: Document): ParsedSchema[] {
    const schemas: ParsedSchema[] = [];
    const rdfaElements = document.querySelectorAll('[typeof]');
    
    rdfaElements.forEach((element: Element) => {
      try {
        const typeOf = element.getAttribute('typeof') || 'Unknown';
        const data = this.parseRdfaElement(element);
        
        schemas.push({
          type: typeOf,
          data,
          format: SchemaType.RDFA,
          errors: [],
          warnings: [],
        });
      } catch (error: any) {
        schemas.push({
          type: 'RDFa',
          data: {},
          format: SchemaType.RDFA,
          errors: [{ type: 'error', message: `Error parsing RDFa: ${error?.message || 'Unknown error'}` }],
          warnings: [],
        });
      }
    });
    
    return schemas;
  }

  private parseMicrodataElement(element: Element): any {
    const data: any = {};
    const itemType = element.getAttribute('itemtype');
    if (itemType) data['@type'] = itemType;
    
    const propElements = element.querySelectorAll('[itemprop]');
    propElements.forEach((propElement: Element) => {
      const propName = propElement.getAttribute('itemprop');
      if (propName) {
        const content = propElement.getAttribute('content') || 
                       propElement.textContent?.trim() || '';
        data[propName] = content;
      }
    });
    
    return data;
  }

  private parseRdfaElement(element: Element): any {
    const data: any = {};
    const typeOf = element.getAttribute('typeof');
    if (typeOf) data['@type'] = typeOf;
    
    const propElements = element.querySelectorAll('[property]');
    propElements.forEach((propElement: Element) => {
      const propName = propElement.getAttribute('property');
      if (propName) {
        const content = propElement.getAttribute('content') || 
                       propElement.textContent?.trim() || '';
        data[propName] = content;
      }
    });
    
    return data;
  }

  private validateSchema(schema: ParsedSchema): void {
    const { data, type } = schema;
    
    // Basic validation rules
    if (!data['@type'] && !type) {
      schema.errors.push({
        type: 'error',
        message: 'Schema missing @type property',
        property: '@type'
      });
    }
    
    // Type-specific validation
    switch (type) {
      case 'Article':
        this.validateArticle(schema);
        break;
      case 'Product':
        this.validateProduct(schema);
        break;
      case 'LocalBusiness':
        this.validateLocalBusiness(schema);
        break;
      case 'Recipe':
        this.validateRecipe(schema);
        break;
      case 'FAQ':
        this.validateFAQ(schema);
        break;
      case 'HowTo':
        this.validateHowTo(schema);
        break;
    }
  }

  private validateArticle(schema: ParsedSchema): void {
    const requiredFields = ['headline', 'author', 'datePublished'];
    const recommendedFields = ['image', 'publisher', 'dateModified'];
    
    this.checkRequiredFields(schema, requiredFields);
    this.checkRecommendedFields(schema, recommendedFields);
  }

  private validateProduct(schema: ParsedSchema): void {
    const requiredFields = ['name'];
    const recommendedFields = ['image', 'description', 'offers', 'aggregateRating'];
    
    this.checkRequiredFields(schema, requiredFields);
    this.checkRecommendedFields(schema, recommendedFields);
  }

  private validateLocalBusiness(schema: ParsedSchema): void {
    const requiredFields = ['name', 'address'];
    const recommendedFields = ['telephone', 'openingHours', 'aggregateRating'];
    
    this.checkRequiredFields(schema, requiredFields);
    this.checkRecommendedFields(schema, recommendedFields);
  }

  private validateRecipe(schema: ParsedSchema): void {
    const requiredFields = ['name', 'image', 'author', 'datePublished', 'description'];
    const recommendedFields = ['prepTime', 'cookTime', 'totalTime', 'recipeYield', 'nutrition'];
    
    this.checkRequiredFields(schema, requiredFields);
    this.checkRecommendedFields(schema, recommendedFields);
  }

  private validateFAQ(schema: ParsedSchema): void {
    if (!schema.data.mainEntity || !Array.isArray(schema.data.mainEntity)) {
      schema.errors.push({
        type: 'error',
        message: 'FAQ schema must have mainEntity array',
        property: 'mainEntity'
      });
    }
  }

  private validateHowTo(schema: ParsedSchema): void {
    const requiredFields = ['name', 'step'];
    this.checkRequiredFields(schema, requiredFields);
  }

  private checkRequiredFields(schema: ParsedSchema, fields: string[]): void {
    fields.forEach(field => {
      if (!schema.data[field]) {
        schema.errors.push({
          type: 'error',
          message: `Required field '${field}' is missing`,
          property: field
        });
      }
    });
  }

  private checkRecommendedFields(schema: ParsedSchema, fields: string[]): void {
    fields.forEach(field => {
      if (!schema.data[field]) {
        schema.warnings.push({
          type: 'warning',
          message: `Recommended field '${field}' is missing`,
          property: field
        });
      }
    });
  }

  private generateRichSnippetPreviews(schemas: ParsedSchema[]): RichSnippetPreview[] {
    const previews: RichSnippetPreview[] = [];
    
    schemas.forEach(schema => {
      if (schema.errors.length > 0) return; // Skip invalid schemas
      
      const preview = this.createRichSnippetPreview(schema);
      if (preview) {
        previews.push(preview);
      }
    });
    
    return previews;
  }

  private createRichSnippetPreview(schema: ParsedSchema): RichSnippetPreview | null {
    const { data, type } = schema;
    
    switch (type) {
      case 'Article':
        return {
          type: 'Article',
          title: data.headline || data.name,
          description: data.description,
          author: data.author?.name || data.author,
          publishDate: data.datePublished,
          image: data.image?.url || data.image,
        };
        
      case 'Product':
        return {
          type: 'Product',
          title: data.name,
          description: data.description,
          image: data.image?.url || data.image,
          price: data.offers?.price || data.offers?.[0]?.price,
          rating: data.aggregateRating?.ratingValue,
          reviewCount: data.aggregateRating?.reviewCount,
        };
        
      case 'LocalBusiness':
        return {
          type: 'LocalBusiness',
          localBusiness: {
            name: data.name,
            address: this.formatAddress(data.address),
            phone: data.telephone,
            hours: data.openingHours,
            rating: data.aggregateRating?.ratingValue,
          },
        };
        
      case 'Recipe':
        return {
          type: 'Recipe',
          recipe: {
            name: data.name,
            image: data.image?.url || data.image,
            prepTime: data.prepTime,
            cookTime: data.cookTime,
            totalTime: data.totalTime,
            recipeYield: data.recipeYield,
            nutrition: data.nutrition,
          },
        };
        
      case 'FAQPage':
        return {
          type: 'FAQ',
          faq: data.mainEntity?.map((item: any) => ({
            question: item.name,
            answer: item.acceptedAnswer?.text,
          })),
        };
        
      case 'HowTo':
        return {
          type: 'HowTo',
          howTo: {
            name: data.name,
            steps: data.step?.map((step: any) => ({
              name: step.name,
              text: step.text,
              image: step.image?.url || step.image,
            })),
          },
        };
        
      default:
        return null;
    }
  }

  private formatAddress(address: any): string {
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [];
      if (address.streetAddress) parts.push(address.streetAddress);
      if (address.addressLocality) parts.push(address.addressLocality);
      if (address.addressRegion) parts.push(address.addressRegion);
      if (address.postalCode) parts.push(address.postalCode);
      return parts.join(', ');
    }
    return 'Address not available';
  }

  private generateRecommendations(schemas: ParsedSchema[], document: Document): string[] {
    const recommendations: string[] = [];
    
    if (schemas.length === 0) {
      recommendations.push('Add structured data markup to improve search visibility');
      recommendations.push('Consider implementing JSON-LD for easy implementation and maintenance');
    }
    
    const hasJsonLd = schemas.some(s => s.format === SchemaType.JSON_LD);
    if (!hasJsonLd && schemas.length > 0) {
      recommendations.push('Consider migrating to JSON-LD format for better maintainability');
    }
    
    const errorCount = schemas.reduce((acc, s) => acc + s.errors.length, 0);
    if (errorCount > 0) {
      recommendations.push('Fix validation errors to ensure proper search engine recognition');
    }
    
    // Check for missing structured data types
    const hasArticle = schemas.some(s => s.type === 'Article');
    const hasProduct = schemas.some(s => s.type === 'Product');
    const hasBreadcrumb = schemas.some(s => s.type === 'BreadcrumbList');
    
    if (!hasBreadcrumb) {
      recommendations.push('Add BreadcrumbList schema for better navigation in search results');
    }
    
    // Check for Organization schema
    const hasOrganization = schemas.some(s => s.type === 'Organization');
    if (!hasOrganization) {
      recommendations.push('Add Organization schema to establish entity information');
    }
    
    return recommendations;
  }
}
