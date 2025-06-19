// src/associate-payments/dto/add-associate-payment.dto.ts
import { IsString, IsNumber, IsOptional, IsPositive, IsEnum } from '@nestjs/class-validator';
import { Transform } from 'class-transformer';

export class AddAssociatePaymentDto {
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsString()
  paymentDate: string; // Will be converted to Date

  @IsString()
  @IsEnum([
    'Cash',
    'Debit/Credit Cards',
    'UPI',
    'Mobile Wallets',
    'Net Banking',
    'Immediate Payment Service (IMPS)',
    'National Electronic Funds Transfer (NEFT)',
    'Cheque'
  ])
  paymentMode: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}