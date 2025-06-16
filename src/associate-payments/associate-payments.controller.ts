// src/associate-payments/associate-payments.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { AssociatePaymentsService } from './associate-payments.service';
  import {
    CreateAssociatePaymentDto,
    AddAssociatePaymentDto,
    QueryAssociatePaymentDto,
  } from './dto';
  
  @Controller('associate-payments')
  export class AssociatePaymentsController {
    constructor(
      private readonly associatePaymentsService: AssociatePaymentsService,
    ) {}
  
    // Create a new associate payment record
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createAssociatePaymentDto: CreateAssociatePaymentDto) {
      return this.associatePaymentsService.create(createAssociatePaymentDto);
    }
  
    // Get all associate payments for a firm
    @Get('firm/:firmId')
    async findByFirm(
      @Param('firmId') firmId: string,
      @Query() query: QueryAssociatePaymentDto,
    ) {
      return this.associatePaymentsService.findByFirm(firmId, query);
    }
  
    // Get statistics for a firm
    @Get('firm/:firmId/statistics')
    async getStatistics(@Param('firmId') firmId: string) {
      return this.associatePaymentsService.getStatistics(firmId);
    }
  
    // Get all payments for a specific associate
    @Get('associates/:associateId')
    async findByAssociate(@Param('associateId') associateId: string) {
      return this.associatePaymentsService.findByAssociate(associateId);
    }
  
    // Get payment history for a specific project-associate combination
    @Get('projects/:projectId/associates/:associateId/history')
    async getPaymentHistory(
      @Param('projectId') projectId: string,
      @Param('associateId') associateId: string,
    ) {
      return this.associatePaymentsService.getPaymentHistory(
        projectId,
        associateId,
      );
    }
  
    // Get specific associate payment record
    @Get('projects/:projectId/associates/:associateId')
    async findByProjectAndAssociate(
      @Param('projectId') projectId: string,
      @Param('associateId') associateId: string,
    ) {
      return this.associatePaymentsService.findByProjectAndAssociate(
        projectId,
        associateId,
      );
    }
  
    // Add a payment to associate payment history
    @Post('projects/:projectId/associates/:associateId/payments')
    @HttpCode(HttpStatus.CREATED)
    async addPayment(
      @Param('projectId') projectId: string,
      @Param('associateId') associateId: string,
      @Body() addAssociatePaymentDto: AddAssociatePaymentDto,
    ) {
      return this.associatePaymentsService.addPayment(
        projectId,
        associateId,
        addAssociatePaymentDto,
      );
    }
  
    // Delete a payment from history
    @Delete('projects/:projectId/associates/:associateId/payments/:paymentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePayment(
      @Param('projectId') projectId: string,
      @Param('associateId') associateId: string,
      @Param('paymentId') paymentId: string,
    ) {
      return this.associatePaymentsService.deletePayment(
        projectId,
        associateId,
        paymentId,
      );
    }
  }