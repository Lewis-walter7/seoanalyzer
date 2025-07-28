import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ViewportDto {
  @IsNumber()
  width!: number;

  @IsNumber()
  height!: number;
}

export class CreateCrawlJobDto {
  @IsArray()
  @IsUrl({}, { each: true })
  urls!: string[];

  @IsNumber()
  @Min(0)
  maxDepth: number = 3;

  @IsNumber()
  @Min(1)
  maxPages: number = 100;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsBoolean()
  disableJavaScript?: boolean = false;

  @IsOptional()
  @IsBoolean()
  respectRobotsTxt?: boolean = true;

  @IsOptional()
  @IsNumber()
  @Min(0)
  crawlDelay?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedDomains?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludePatterns?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includePatterns?: string[];

  @IsOptional()
  @IsObject()
  customHeaders?: Record<string, string>;

  @IsOptional()
  @ValidateNested()
  @Type(() => ViewportDto)
  viewport?: ViewportDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeout?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  retries?: number;
}
