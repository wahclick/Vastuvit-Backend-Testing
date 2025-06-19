import { PartialType } from '@nestjs/mapped-types';
import { CreateAssociateDto } from './create-associate.dto';
import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  ValidateNested, 
  IsEnum,
  IsMongoId,
  Matches,
  IsObject
} from '@nestjs/class-validator';
import { Type, Transform } from 'class-transformer';

class UpdateAddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

class UpdateBankDetailsDto {
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountName?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  ifscCode?: string;
}

export class UpdateAssociateDto {
  @IsOptional()
  @IsString()
  @IsMongoId({ message: 'User ID must be a valid MongoDB ObjectId' })
  user_id?: string;

  @IsOptional()
  @IsString()
  @IsMongoId({ message: 'Firm ID must be a valid MongoDB ObjectId' })
  firm_id?: string;

  @IsOptional()
  @IsString()
  prefix?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Telephone must be 10 digits' })
  telephone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Additional telephone must be 10 digits' })
  additionalTelephone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value?.toLowerCase())
  email?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  @IsObject()
  address?: UpdateAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateBankDetailsDto)
  @IsObject()
  bankDetails?: UpdateBankDetailsDto;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;
}