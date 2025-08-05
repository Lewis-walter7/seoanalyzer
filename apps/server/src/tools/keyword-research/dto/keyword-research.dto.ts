import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchEngine {
  GOOGLE = 'GOOGLE',
  BING = 'BING',
  YAHOO = 'YAHOO',
}

export enum Device {
  DESKTOP = 'DESKTOP',
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
}

export class CreateKeywordResearchDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  projectId!: string;

  @IsArray()
  @IsString({ each: true })
  seedKeywords!: string[];

  @IsOptional()
  @IsEnum(SearchEngine)
  searchEngine?: SearchEngine = SearchEngine.GOOGLE;

  @IsOptional()
  @IsString()
  location?: string = 'Global';

  @IsOptional()
  @IsString()
  language?: string = 'en';

  @IsOptional()
  @IsEnum(Device)
  device?: Device = Device.DESKTOP;
}

export class UpdateKeywordResearchDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seedKeywords?: string[];

  @IsOptional()
  @IsEnum(SearchEngine)
  searchEngine?: SearchEngine;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsEnum(Device)
  device?: Device;
}

export class KeywordAnalysisDto {
  @IsArray()
  @IsString({ each: true })
  keywords!: string[];

  @IsOptional()
  @IsBoolean()
  includeSearchVolume?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeCompetition?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeCpc?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeTrends?: boolean = false;
}

export class KeywordMetric {
  @IsString()
  keyword!: string;

  @IsOptional()
  @IsNumber()
  searchVolume?: number;

  @IsOptional()
  @IsNumber()
  competition?: number; // 0-1

  @IsOptional()
  @IsNumber()
  cpc?: number;

  @IsOptional()
  @IsNumber()
  difficulty?: number; // 0-100

  @IsOptional()
  @IsArray()
  trends?: number[]; // Monthly trend data
}

export class KeywordSuggestion {
  @IsString()
  keyword!: string;

  @IsNumber()
  relevanceScore!: number; // 0-100

  @IsOptional()
  @IsNumber()
  searchVolume?: number;

  @IsOptional()
  @IsString()
  category?: string;
}
