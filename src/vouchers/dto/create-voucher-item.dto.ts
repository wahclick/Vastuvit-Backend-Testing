// create-voucher-item.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsPositive, Min } from '@nestjs/class-validator';
import { Type } from 'class-transformer';


export class CreateVoucherItemDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  sNo: number;

  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  description: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;
}