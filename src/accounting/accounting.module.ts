import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';
import { Accounting, AccountingSchema } from './schemas/accounting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Accounting.name, schema: AccountingSchema },
    ]),
  ],
  controllers: [AccountingController],
  providers: [AccountingService],
  exports: [AccountingService],
})
export class AccountingModule {}
