import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  IsMongoId,
} from '@nestjs/class-validator';

import { CreateVoucherItemDto } from './create-voucher-item.dto';
import { Type } from 'class-transformer';

export class UpdateVoucherDto {
  @IsOptional()
  @IsDateString()
  voucherDate?: Date;

  @IsOptional()
  @IsString()
  debitAccount?: string;

  @IsOptional()
  @IsString()
  payTo?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVoucherItemDto)
  items?: CreateVoucherItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  // Remove status and approval fields - not needed
}