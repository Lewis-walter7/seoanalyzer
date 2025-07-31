import { SeoAudit } from "@prisma/client";

export class SeoAnalyzer {
  analyzeHtml(html: string): SeoAudit {
    const title = this.extractTagContent(html, 'title');
    const metaDescription = this.extractMetaContent(html, 'description');

    const h1Count = this.countTags(html, 'h1');
    const h2Count = this.countTags(html, 'h2');

    // Sample logic for image alt checks
    const totalImages = (html.match(/<img /g) || []).length;
    const imagesWithoutAlt = (html.match(/<img [^>]*alt=""/g) || []).length;

    return {
      id: '', // This field will be filled when saving to DB.
      pageId: '', // This should also be filled when saving, relating to the Page.
      titleTag: title || null,
      titleExists: !!title,
      metaDescription: metaDescription || null,
      metaDescriptionExists: !!metaDescription,
      h1Count,
      h2Count,
      totalImages,
      imagesWithoutAlt,
      imagesWithAlt: totalImages - imagesWithoutAlt,
      // Initialize additional SeoAudit fields as necessary...
    };
  }

  private extractTagContent(html: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'i');
    const match = html.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractMetaContent(html: string, name: string): string | null {
    const regex = new RegExp(`<meta[^>]+name=['"]${name}['"][^>]*content=['"]([^'"]+)['"][^>]*>`, 'i');
    const match = html.match(regex);
    return match ? match[1].trim() : null;
  }

  private countTags(html: string, tag: string): number {
    const regex = new RegExp(`<${tag}[^>]*>`, 'gi');
    const matches = html.match(regex);
    return matches ? matches.length : 0;
  }
}
