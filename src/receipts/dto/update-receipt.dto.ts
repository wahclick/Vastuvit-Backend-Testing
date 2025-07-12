import { Type } from "class-transformer";
import { IsOptional, IsDateString, IsEnum, IsArray, ValidateNested, IsString } from "class-validator";
import { PaymentMode } from "../schemas/receipt.schema";
import { CreateReceiptItemDto } from "./create-receipt-item.dto";

export class UpdateReceiptDto {
  @IsOptional()
  @IsDateString()
  receiptDate?: Date;

  @IsOptional()
  @IsEnum(PaymentMode)
  modeOfPayment?: PaymentMode;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptItemDto)
  items?: CreateReceiptItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['DRAFT', 'RECEIVED', 'PROCESSED', 'CANCELLED'])
  status?: string;
}
