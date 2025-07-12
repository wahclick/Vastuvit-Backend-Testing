import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VoucherSchema } from './schemas/voucher.schema';
import { FirmsSchema } from 'src/firms/schemas/firms.schema';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Voucher', schema: VoucherSchema },
      { name: 'Firms', schema: FirmsSchema }, // Import your existing firms schema
    ]),
  ],
  controllers: [VouchersController],
  providers: [VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}