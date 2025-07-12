// update-client.dto.ts
import {
  IsString,
  IsOptional,
  IsMongoId,
  IsEmail,
  IsDateString,
  IsArray,
  IsBoolean,
} from '@nestjs/class-validator';
import { Types } from 'mongoose';

export class UpdateClientDto {
  @IsMongoId()
  @IsOptional()
  userId?: Types.ObjectId;

  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  projectIds?: Types.ObjectId[];

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @IsString()
  @IsOptional()
  additionalNumber?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @IsDateString()
  @IsOptional()
  dateOfAnniversary?: Date;

  @IsString()
  @IsOptional()
  pointOfContact?: string;

  @IsString()
  @IsOptional()
  pointOfContactAddress?: string;

  @IsString()
  @IsOptional()
  pointOfContactMobileNumber?: string;

  @IsString()
  @IsOptional()
  specificClientRequest?: string;

  @IsString()
  @IsOptional()
  gstin?: string;

  @IsMongoId()
  @IsOptional()
  firmId?: Types.ObjectId;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}
