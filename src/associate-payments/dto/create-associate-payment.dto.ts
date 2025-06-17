// src/associate-payments/dto/create-associate-payment.dto.ts
import { IsString, IsNumber, IsOptional, IsPositive, IsMongoId, IsEnum } from '@nestjs/class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateAssociatePaymentDto {
  @IsMongoId()
  associateId: Types.ObjectId;

  @IsMongoId()
  projectId: Types.ObjectId;

  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  firmId: Types.ObjectId;

  @IsString()
  projectName: string;

  @IsString()
  associateName: string;

  @IsString()
  @IsEnum(['Consultant', 'Contractor', 'Vendor', 'Supplier'])
  associateType: string;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  totalProjectAmount: number;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  areaSqMtr: number;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  areaSqFt: number;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  rate: number;

  @IsOptional()
  @IsString()
  projectRemarks?: string;
}