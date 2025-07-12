import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from '@nestjs/class-validator';
import { Type } from 'class-transformer';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';
import { PaymentMode, GSTType } from './create-invoice.dto';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsDateString()
  billDate?: Date;

  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @IsOptional()
  @IsString()
  siteAddress?: string;

  @IsOptional()
  @IsEnum(PaymentMode)
  modeOfPayment?: PaymentMode;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items?: CreateInvoiceItemDto[];

  @IsOptional()
  @IsEnum(GSTType)
  gstType?: GSTType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  gstPercentage?: number;

  @IsOptional()
  @IsBoolean()
  includeDiscount?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountPercentage?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'])
  status?: string;
}
