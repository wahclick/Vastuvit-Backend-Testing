import { CreateProjectDetailDto } from './project-details.dto';
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

export class QueryProjectDetailDto {
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

  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean | string;
}
