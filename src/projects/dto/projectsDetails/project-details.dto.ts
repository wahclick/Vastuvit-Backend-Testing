import {
  IsString,
  IsOptional,
  IsMongoId,
  IsBoolean,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from '@nestjs/class-validator';
import { Type } from 'class-transformer';
import e from 'express';
import { Types } from 'mongoose';

// DTO for creating project details
// First, define PropertyItemDto
export class PropertyItemDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsOptional()
  value?: any;
}

// DTO for creating project details
export class CreateProjectDetailDto {
  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean = false;

  @IsMongoId()
  @IsOptional()
  blockId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  wingId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  clusterId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  unitId?: Types.ObjectId;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyItemDto)
  @IsOptional()
  properties?: PropertyItemDto[];
}
