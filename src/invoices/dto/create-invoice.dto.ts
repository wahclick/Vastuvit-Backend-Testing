import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsMongoId,
} from '@nestjs/class-validator';
import { Type } from 'class-transformer';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export enum PaymentMode {
  CASH = 'Cash',
  CHEQUE = 'Cheque',
  BANK_TRANSFER = 'Bank Transfer',
  UPI = 'UPI',
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
}

export enum GSTType {
  SGST_CGST = 'SGST-CGST',
  UTGST = 'UTGST',
  IGST = 'IGST',
}

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsMongoId()
  firmId: string;

  @IsNotEmpty()
  @IsMongoId()
  clientId: string;

  @IsNotEmpty()
  @IsMongoId()
  projectId: string;

  @IsNotEmpty()
  @IsDateString()
  billDate: Date;

  @IsNotEmpty()
  @IsDateString()
  dueDate: Date;

  @IsNotEmpty()
  @IsString()
  siteAddress: string;

  @IsNotEmpty()
  @IsEnum(PaymentMode)
  modeOfPayment: PaymentMode;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];

  @IsNotEmpty()
  @IsEnum(GSTType)
  gstType: GSTType;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  gstPercentage: number;

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

  @IsNotEmpty()
  @IsMongoId()
  createdBy: string;
}
