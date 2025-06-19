// src/referral-payments/referral-payments.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralPaymentsController } from './referral-payments.controller';
import { ReferralPaymentsService } from './referral-payments.service';
import { ReferralPayment, ReferralPaymentSchema } from './schemas/referral-payment.schema';
import { ReferralSchema } from 'src/referral/schema/referral.schema';
import { ProjectSchema } from 'src/projects/schemas/projects.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReferralPayment.name, schema: ReferralPaymentSchema },
      { name: 'Referral', schema: ReferralSchema }, // Add this
      { name: 'Project', schema: ProjectSchema },   // Add this
    ]),
  ],
  controllers: [ReferralPaymentsController],
  providers: [ReferralPaymentsService],
  exports: [ReferralPaymentsService],
})
export class ReferralPaymentsModule {}