import {
  IsString,
  IsUrl,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsUrl()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  @Transform(({ value }) => {
    // Handle both string and array inputs
    if (typeof value === 'string') {
      return value.split(',').map(k => k.trim()).filter(Boolean);
    }
    return Array.isArray(value) ? value : [];
  })
  targetKeywords?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @Transform(({ value }) => {
    // Handle both string and array inputs
    if (typeof value === 'string') {
      return value.split(',').map(c => c.trim()).filter(Boolean);
    }
    return Array.isArray(value) ? value : [];
  })
  competitors?: string[];
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsUrl()
  @IsNotEmpty()
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(k => k.trim()).filter(Boolean);
    }
    return Array.isArray(value) ? value : [];
  })
  targetKeywords?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(c => c.trim()).filter(Boolean);
    }
    return Array.isArray(value) ? value : [];
  })
  competitors?: string[];
}