import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProformaItemDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  hsn: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  unit: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  rate: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;
}
