import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  Min,
  Max,
} from '@nestjs/class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  sNo: number;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  hsn: string;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  rate: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;
}
