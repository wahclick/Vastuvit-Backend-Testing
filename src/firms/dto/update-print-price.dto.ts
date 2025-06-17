// Create this file: dto/update-print-price.dto.ts

import {
  IsArray,
  IsString,
  IsNumber,
  IsNotEmpty,
  ValidateNested,
  Min,
} from '@nestjs/class-validator';
import { Type } from 'class-transformer';

export class PrintPriceItemDto {
  @IsString()
  @IsNotEmpty()
  printSize: string;

  @IsString()
  @IsNotEmpty()
  printType: string;

  @IsNumber()
  @Min(0)
  cost: number;
}

export class UpdatePrintPriceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrintPriceItemDto)
  printPrices: PrintPriceItemDto[];
}

export class UpdateSpecificPrintPriceDto {
  @IsNumber()
  @Min(0)
  cost: number;
}
