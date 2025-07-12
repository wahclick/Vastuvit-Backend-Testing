import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber, IsDateString, ValidateNested, IsMongoId, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProformaItemDto } from './create-proforma-item.dto';

export class CreateProformaInvoiceDto {
  @IsNotEmpty()
  @IsMongoId()
  clientId: string;

  @IsNotEmpty()
  @IsMongoId()
  projectId: string;

  @IsNotEmpty()
  @IsMongoId()
  firmId: string;

  @IsNotEmpty()
  @IsDateString()
  piDate: string;

  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProformaItemDto)
  items: CreateProformaItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  gstPercentage?: number;

  @IsOptional()
  @IsString()
  gstType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @IsNotEmpty()
  @IsString()
  paymentMode: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  termsAndConditions?: string[];

  @IsNotEmpty()
  @IsMongoId()
  createdBy: string;
}