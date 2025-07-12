import { PartialType } from '@nestjs/mapped-types';
import { CreateProformaInvoiceDto } from './create-proforma-invoice.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateProformaInvoiceDto extends PartialType(CreateProformaInvoiceDto) {
    @IsOptional()
    @IsString()
    amountInWords?: string;
}
