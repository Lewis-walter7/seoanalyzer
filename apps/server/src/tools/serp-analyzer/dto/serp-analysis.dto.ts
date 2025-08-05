import { IsString, IsOptional, IsObject, IsEnum, IsArray, IsNumber, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchEngine {
  GOOGLE = 'GOOGLE',
  BING = 'BING',
  YAHOO = 'YAHOO',
  DUCKDUCKGO = 'DUCKDUCKGO',
}

export enum Device {
  DESKTOP = 'DESKTOP',
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
}

export class SerpAnalysisDto {
  @IsString()
  keyword!: string;

  @IsObject()
  serpData!: any; // Raw SERP data to be analyzed

  @IsOptional()
  @IsEnum(SearchEngine)
  searchEngine?: SearchEngine = SearchEngine.GOOGLE;

  @IsOptional()
  @IsString()
  location?: string = 'Global';

  @IsOptional()
  @IsEnum(Device)
  device?: Device = Device.DESKTOP;

  @IsOptional()
  @IsString()
  projectId?: string;
}

export class SerpResult {
  @IsNumber()
  position!: number;

  @IsString()
  title!: string;

  @IsString()
  url!: string;

  @IsString()
  description!: string;

  @IsString()
  displayUrl!: string;

  @IsString()
  type!: 'organic' | 'paid' | 'local' | 'shopping' | 'news' | 'image' | 'video';

  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @IsObject()
  metadata!: {
    hasImages: boolean;
    hasVideo: boolean;
    hasRichSnippet: boolean;
    datePublished: string | null;
    author: string | null;
    rating: number | null;
    price: string | null;
  };
}

export class SerpFeature {
  @IsString()
  type!: 'knowledge_graph' | 'featured_snippet' | 'local_pack' | 'people_also_ask' | 'related_searches' | 'shopping_results' | 'news_box' | 'image_pack' | 'video_carousel';

  @IsNumber()
  position!: number;

  @IsObject()
  content!: any;
}

export class ContentDetail {
  @IsNumber()
  averageTitleLength!: number;

  @IsNumber()
  averageDescriptionLength!: number;

  @IsNumber()
  totalDomains!: number;

  @IsArray()
  topDomains!: Array<{
    domain: string;
    count: number;
    percentage: number;
  }>;

  @IsBoolean()
  hasRichSnippets!: boolean;

  @IsBoolean()
  hasImages!: boolean;

  @IsBoolean()
  hasVideos!: boolean;

  @IsString()
  competitionLevel!: 'low' | 'medium' | 'high';
}

export class SerpAnalysisResult {
  @IsString()
  id!: string;

  @IsString()
  userId!: string;

  @IsString()
  keyword!: string;

  @IsEnum(SearchEngine)
  searchEngine!: SearchEngine;

  @IsString()
  location!: string;

  @IsEnum(Device)
  device!: Device;

  @IsString()
  timestamp!: Date;

  @IsNumber()
  totalResults!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SerpResult)
  organicResults!: SerpResult[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SerpResult)
  paidResults!: SerpResult[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SerpFeature)
  features!: SerpFeature[];

  @ValidateNested()
  @Type(() => ContentDetail)
  contentAnalysis!: ContentDetail;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SerpResult)
  results!: SerpResult[];
}
