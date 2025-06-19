// src/accounting/dto/create-accounting.dto.ts
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsMongoId,
} from '@nestjs/class-validator';
import { PaymentStatus } from '../enums/payment-status.enum';

export class CreateAccountingDto {
  @IsMongoId()
  firmId: string;

  @IsOptional()
  @IsString()
  personId?: string;

  @IsOptional()
  @IsString()
  personName?: string;

  @IsDateString()
  tentativeDate: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsString()
  paymentType: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  modeOfPayment?: string;

  @IsOptional()
  @IsString()
  accountNo?: string;

  @IsOptional()
  @IsDateString()
  dateOfPayment?: string;

  @IsOptional()
  @IsString()
  expenseType?: string;
}


