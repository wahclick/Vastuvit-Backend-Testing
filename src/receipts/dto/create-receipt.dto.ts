import { IsNotEmpty, IsString, IsDateString, IsEnum, IsArray, ValidateNested, IsOptional, IsNumber, IsMongoId, Min } from '@nestjs/class-validator';
import { Type } from 'class-transformer';
import { CreateReceiptItemDto } from './create-receipt-item.dto';
import { PaymentMode } from '../schemas/receipt.schema';

export class CreateReceiptDto {
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
  receiptDate: Date;

  @IsNotEmpty()
  @IsEnum(PaymentMode)
  modeOfPayment: PaymentMode;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptItemDto)
  items: CreateReceiptItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsMongoId()
  createdBy: string;
}