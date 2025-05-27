import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsIn,
} from '@nestjs/class-validator';
import { Type } from 'class-transformer';

export class QueryReferralDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended', 'all'])
  status?: string = 'active';

  @IsOptional()
  @IsString()
  search?: string = '';
}
