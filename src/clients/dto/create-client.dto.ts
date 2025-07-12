// create-client.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsEmail,
  IsDateString,
  IsArray,
} from '@nestjs/class-validator';
import { Types } from 'mongoose';

export class CreateClientDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  projectIds?: Types.ObjectId[];

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

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
  @IsNotEmpty()
  firmId: Types.ObjectId;

  @IsOptional()
  isEnabled?: boolean = true;
}
