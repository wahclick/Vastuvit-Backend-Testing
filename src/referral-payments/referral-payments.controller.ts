// src/referral-payments/referral-payments.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ReferralPaymentsService } from './referral-payments.service';
import {
  CreateReferralPaymentDto,
  AddPaymentDto,
  QueryReferralPaymentDto,
} from './dto';

@Controller('referral-payments')
export class ReferralPaymentsController {
  constructor(
    private readonly referralPaymentsService: ReferralPaymentsService,
  ) {}

  // Create referral payment record
  @Post()
  create(@Body() createReferralPaymentDto: CreateReferralPaymentDto) {
    return this.referralPaymentsService.create(createReferralPaymentDto);
  }

  // Get referral payments by referral ID
  @Get('referral/:referralId')
  findByReferral(@Param('referralId') referralId: string) {
    return this.referralPaymentsService.findByReferral(referralId);
  }

  // Get referral payments by firm
  @Get('firm/:firmId')
  findByFirm(
    @Param('firmId') firmId: string,
    @Query() query: QueryReferralPaymentDto,
  ) {
    return this.referralPaymentsService.findByFirm(firmId, query);
  }

  // Get payment history for specific project-referral combination
  @Get('project/:projectId/referral/:referralId/history')
  getPaymentHistory(
    @Param('projectId') projectId: string,
    @Param('referralId') referralId: string,
  ) {
    return this.referralPaymentsService.getPaymentHistory(
      projectId,
      referralId,
    );
  }

  // Add payment
  @Post('project/:projectId/referral/:referralId/payment')
  addPayment(
    @Param('projectId') projectId: string,
    @Param('referralId') referralId: string,
    @Body() addPaymentDto: AddPaymentDto,
  ) {
    return this.referralPaymentsService.addPayment(
      projectId,
      referralId,
      addPaymentDto,
    );
  }

  // Delete payment
  @Delete('project/:projectId/referral/:referralId/payment/:paymentId')
  deletePayment(
    @Param('projectId') projectId: string,
    @Param('referralId') referralId: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.referralPaymentsService.deletePayment(
      projectId,
      referralId,
      paymentId,
    );
  }

  // Get statistics for firm
  @Get('firm/:firmId/statistics')
  getStatistics(@Param('firmId') firmId: string) {
    return this.referralPaymentsService.getStatistics(firmId);
  }
}
