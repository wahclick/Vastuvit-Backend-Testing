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

import { Type } from 'class-transformer';
import { CreateVoucherItemDto } from './create-voucher-item.dto';

export class CreateVoucherDto {
  @IsNotEmpty()
  @IsMongoId()
  firmId: string;

  @IsNotEmpty()
  @IsDateString()
  voucherDate: Date;

  @IsNotEmpty()
  @IsString()
  debitAccount: string;

  @IsNotEmpty()
  @IsString()
  payTo: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVoucherItemDto)
  items: CreateVoucherItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsMongoId()
  createdBy: string;
}
