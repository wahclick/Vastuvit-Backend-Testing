import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsMongoId,
} from '@nestjs/class-validator';
import { Transform } from 'class-transformer';

export class AssignProjectDto {
  @IsString()
  @IsMongoId({ message: 'Project ID must be a valid MongoDB ObjectId' })
  projectId: string;

  @IsNumber({}, { message: 'Total amount must be a number' })
  @IsPositive({ message: 'Total amount must be positive' })
  @Transform(({ value }) => parseFloat(value))
  totalAmount: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsNumber({}, { message: 'Area in square meters must be a number' })
  @IsPositive({ message: 'Area in square meters must be positive' })
  @Transform(({ value }) => parseFloat(value))
  areaSqMtr: number; // area in square meters

  @IsNumber({}, { message: 'Area in square feet must be a number' })
  @IsPositive({ message: 'Area in square feet must be positive' })
  @Transform(({ value }) => parseFloat(value))
  areaSqFt: number; // area in square feet

  @IsNumber({}, { message: 'Rate must be a number' })
  @IsPositive({ message: 'Rate must be positive' })
  @Transform(({ value }) => parseFloat(value))
  rate: number; // rate per unit
}
