import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  Matches,
} from '@nestjs/class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  country: string;
}

class BankDetailsDto {
  @IsNotEmpty()
  @IsString()
  bankName: string;

  @IsNotEmpty()
  @IsString()
  accountName: string;

  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  ifscCode: string;
}

export class CreateReferralDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  firm_id: string;

  // Your existing properties...
  @IsNotEmpty()
  @IsString()
  prefix: string;


  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @Matches(/^\d{10}$/, { message: 'Telephone must be 10 digits' })
  telephone: string;

  @IsOptional()
  @Matches(/^\d{10}$/, { message: 'Additional telephone must be 10 digits' })
  additionalTelephone?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ValidateNested()
  @Type(() => BankDetailsDto)
  bankDetails: BankDetailsDto;

  @IsNumber()
  @Min(0)
  @Max(100)
  referralPercentage: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  referralAmount?: number;
}
