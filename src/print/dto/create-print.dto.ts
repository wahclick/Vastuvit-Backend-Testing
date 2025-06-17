import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from '@nestjs/class-validator';
import { PrintType, PrintSize } from '../schema/print.schema';

export class CreatePrintDto {
  @IsOptional()
  @IsString()
  project_id?: string;

  @IsEnum(PrintType)
  @IsNotEmpty()
  type: PrintType;

  @IsEnum(PrintSize)
  @IsNotEmpty()
  size: PrintSize;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  number_of_prints: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsNotEmpty()
  @IsString()
  submitted_by: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsString()
  expense_head?: string;

  @IsOptional()
  @IsString()
  expense_type?: string;
}
