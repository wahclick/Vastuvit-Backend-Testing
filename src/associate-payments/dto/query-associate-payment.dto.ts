// src/associate-payments/dto/query-associate-payment.dto.ts
import { IsOptional, IsString, IsMongoId, IsEnum } from '@nestjs/class-validator';

export class QueryAssociatePaymentDto {
  @IsOptional()
  @IsString()
  @IsEnum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'ON_HOLD'])
  status?: string;

  @IsOptional()
  @IsMongoId()
  associateId?: string;

  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['Consultant', 'Contractor', 'Vendor', 'Supplier'])
  associateType?: string;
}