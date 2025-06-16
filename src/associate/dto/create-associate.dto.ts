import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  ValidateNested, 
  IsEnum,
  IsMongoId,
  Matches,
  IsNotEmpty,
  IsObject
} from '@nestjs/class-validator';
import { Type, Transform } from 'class-transformer';

class AddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

class BankDetailsDto {
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsNotEmpty()
  accountName: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toUpperCase())
  ifscCode: string;
}

export class CreateAssociateDto {
  @IsString()
  @IsMongoId({ message: 'User ID must be a valid MongoDB ObjectId' })
  user_id: string;

  @IsString()
  @IsMongoId({ message: 'Firm ID must be a valid MongoDB ObjectId' })
  firm_id: string;

  @IsString()
  @IsNotEmpty()
  prefix: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  lastName: string;

  @IsString()
  @Matches(/^\d{10}$/, { message: 'Telephone must be 10 digits' })
  telephone: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Additional telephone must be 10 digits' })
  additionalTelephone?: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject()
  address: AddressDto;

  @ValidateNested()
  @Type(() => BankDetailsDto)
  @IsObject()
  bankDetails: BankDetailsDto;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;
}