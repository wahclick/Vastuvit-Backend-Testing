// src/referral-payments/referral-payments.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ReferralPayment,
  ReferralPaymentDocument,
} from './schemas/referral-payment.schema';
import {
  CreateReferralPaymentDto,
  AddPaymentDto,
  QueryReferralPaymentDto,
} from './dto';

@Injectable()
export class ReferralPaymentsService {
  constructor(
    @InjectModel(ReferralPayment.name)
    private referralPaymentModel: Model<ReferralPaymentDocument>,
    @InjectModel('Referral')
    private referralModel: Model<any>,
    @InjectModel('Project')
    private projectModel: Model<any>,
  ) {}

  // Create a new referral payment record
  async create(
    createReferralPaymentDto: CreateReferralPaymentDto,
  ): Promise<ReferralPaymentDocument> {
    try {
      // Check if referral payment already exists for this project-referral combination
      const existingPayment = await this.referralPaymentModel.findOne({
        referralId: createReferralPaymentDto.referralId,
        projectId: createReferralPaymentDto.projectId,
      });

      if (existingPayment) {
        throw new BadRequestException(
          'Referral payment record already exists for this project',
        );
      }

      const createdPayment = new this.referralPaymentModel(
        createReferralPaymentDto,
      );
      return await createdPayment.save();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create referral payment: ${error.message}`,
      );
    }
  }

  // Get referral payments by referral ID
  async findByReferral(referralId: string): Promise<ReferralPayment[]> {
    try {
      if (!Types.ObjectId.isValid(referralId)) {
        throw new BadRequestException('Invalid referral ID format');
      }

      const payments = await this.referralPaymentModel
        .find({ referralId: new Types.ObjectId(referralId), isEnabled: true })
        .populate('projectId', 'name status')
        .populate('referralId', 'fullName telephone')
        .exec();

      return payments;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch referral payments: ${error.message}`,
      );
    }
  }

  // Get specific referral payment by project and referral
  async findByProjectAndReferral(
    projectId: string,
    referralId: string,
  ): Promise<ReferralPaymentDocument> {
    try {
      if (
        !Types.ObjectId.isValid(projectId) ||
        !Types.ObjectId.isValid(referralId)
      ) {
        throw new BadRequestException(
          'Invalid project ID or referral ID format',
        );
      }

      const payment = await this.referralPaymentModel
        .findOne({
          projectId: new Types.ObjectId(projectId),
          referralId: new Types.ObjectId(referralId),
          isEnabled: true,
        })
        .populate('projectId', 'name status')
        .populate('referralId', 'fullName telephone')
        .exec();

      if (!payment) {
        throw new NotFoundException('Referral payment record not found');
      }

      return payment;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch referral payment: ${error.message}`,
      );
    }
  }

  // Add payment to history
  // Updated addPayment method for your project schema structure
  async addPayment(
    projectId: string,
    referralId: string,
    addPaymentDto: AddPaymentDto,
  ): Promise<ReferralPaymentDocument> {
    try {
      let payment: ReferralPaymentDocument;

      // Try to find existing payment record
      try {
        payment = await this.findByProjectAndReferral(projectId, referralId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          // Auto-create the referral payment record if it doesn't exist
          console.log('Referral payment record not found, creating new one...');

          // Fetch referral and project details
          const referral = await this.referralModel.findById(referralId);
          const project = await this.projectModel.findById(projectId);

          if (!referral) {
            throw new NotFoundException('Referral not found');
          }
          if (!project) {
            throw new NotFoundException('Project not found');
          }

          // Check if this referral is assigned to this project
          if (
            !project.referralId ||
            project.referralId.toString() !== referralId
          ) {
            throw new NotFoundException(
              'Referral is not assigned to this project',
            );
          }

          // Use the referral data directly from the project document
          const createData: CreateReferralPaymentDto = {
            referralId: new Types.ObjectId(referralId),
            projectId: new Types.ObjectId(projectId),
            userId: project.userId, // Use project's userId
            firmId: project.firmId, // Use project's firmId
            projectName: project.name,
            referralName: project.referralName,
            totalReferralAmount: project.referralAmount,
            referralPercentage: project.referralPercentage || 0,
          };

          payment = await this.create(createData);
          console.log('Referral payment record created successfully');
        } else {
          throw error;
        }
      }

      // Now proceed with adding the payment
      const newTotalPaid = payment.totalPaidAmount + addPaymentDto.amount;
      const remainingBalance = payment.totalReferralAmount - newTotalPaid;

      if (newTotalPaid > payment.totalReferralAmount) {
        throw new BadRequestException(
          'Payment amount exceeds total referral amount',
        );
      }

      if (addPaymentDto.amount <= 0) {
        throw new BadRequestException(
          'Payment amount must be greater than zero',
        );
      }

      const paymentHistoryItem = {
        _id: new Types.ObjectId(),
        amount: addPaymentDto.amount,
        paymentDate: new Date(addPaymentDto.paymentDate),
        paymentMode: addPaymentDto.paymentMode,
        balance: remainingBalance,
        remarks: addPaymentDto.remarks,
        createdAt: new Date(),
      };

      payment.paymentHistory.push(paymentHistoryItem);
      payment.totalPaidAmount = newTotalPaid;

      // Update status if fully paid
      if (remainingBalance === 0) {
        payment.status = 'COMPLETED';
      }

      return await payment.save();
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to add payment: ${error.message}`,
      );
    }
  }

  // Get payment history and summary
  async getPaymentHistory(projectId: string, referralId: string) {
    try {
      const payment = await this.findByProjectAndReferral(
        projectId,
        referralId,
      );

      // Sort payment history by date (most recent first)
      const sortedHistory = payment.paymentHistory.sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
      );

      return {
        projectName: payment.projectName,
        referralName: payment.referralName,
        totalReferralAmount: payment.totalReferralAmount,
        totalPaidAmount: payment.totalPaidAmount,
        remainingBalance: payment.totalReferralAmount - payment.totalPaidAmount,
        referralPercentage: payment.referralPercentage,
        status: payment.status,
        paymentHistory: sortedHistory,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch payment history: ${error.message}`,
      );
    }
  }

  // Delete payment from history
  async deletePayment(
    projectId: string,
    referralId: string,
    paymentId: string,
  ): Promise<ReferralPaymentDocument> {
    try {
      if (!Types.ObjectId.isValid(paymentId)) {
        throw new BadRequestException('Invalid payment ID format');
      }

      const payment = await this.findByProjectAndReferral(
        projectId,
        referralId,
      );

      const paymentIndex = payment.paymentHistory.findIndex(
        (p) => p._id.toString() === paymentId,
      );

      if (paymentIndex === -1) {
        throw new NotFoundException('Payment not found in history');
      }

      const deletedPayment = payment.paymentHistory[paymentIndex];
      payment.paymentHistory.splice(paymentIndex, 1);

      // Recalculate totals
      payment.totalPaidAmount = payment.paymentHistory.reduce(
        (sum, p) => sum + p.amount,
        0,
      );

      // Update balances for all remaining payments
      let runningBalance = payment.totalReferralAmount;
      payment.paymentHistory
        .sort(
          (a, b) =>
            new Date(a.paymentDate).getTime() -
            new Date(b.paymentDate).getTime(),
        )
        .forEach((p) => {
          runningBalance -= p.amount;
          p.balance = runningBalance;
        });

      // Update status
      payment.status =
        payment.totalPaidAmount === payment.totalReferralAmount
          ? 'COMPLETED'
          : 'ACTIVE';

      return await payment.save();
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete payment: ${error.message}`,
      );
    }
  }

  // Get all referral payments for a firm
  async findByFirm(
    firmId: string,
    query?: QueryReferralPaymentDto,
  ): Promise<ReferralPayment[]> {
    try {
      if (!Types.ObjectId.isValid(firmId)) {
        throw new BadRequestException('Invalid firm ID format');
      }

      const filter: any = {
        firmId: new Types.ObjectId(firmId),
        isEnabled: true,
      };

      if (query?.status) {
        filter.status = query.status;
      }
      if (query?.referralId) {
        if (!Types.ObjectId.isValid(query.referralId)) {
          throw new BadRequestException('Invalid referral ID format in query');
        }
        filter.referralId = new Types.ObjectId(query.referralId);
      }
      if (query?.projectId) {
        if (!Types.ObjectId.isValid(query.projectId)) {
          throw new BadRequestException('Invalid project ID format in query');
        }
        filter.projectId = new Types.ObjectId(query.projectId);
      }

      const payments = await this.referralPaymentModel
        .find(filter)
        .populate('projectId', 'name status')
        .populate('referralId', 'fullName telephone')
        .sort({ createdAt: -1 })
        .exec();

      return payments;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch firm referral payments: ${error.message}`,
      );
    }
  }

  // Get summary statistics
  async getStatistics(firmId: string) {
    try {
      if (!Types.ObjectId.isValid(firmId)) {
        throw new BadRequestException('Invalid firm ID format');
      }

      const payments = await this.referralPaymentModel
        .find({ firmId: new Types.ObjectId(firmId), isEnabled: true })
        .exec();

      const totalOwed = payments.reduce(
        (sum, p) => sum + p.totalReferralAmount,
        0,
      );
      const totalPaid = payments.reduce((sum, p) => sum + p.totalPaidAmount, 0);
      const totalPending = totalOwed - totalPaid;

      const activePayments = payments.filter(
        (p) => p.status === 'ACTIVE',
      ).length;
      const completedPayments = payments.filter(
        (p) => p.status === 'COMPLETED',
      ).length;

      return {
        totalOwed,
        totalPaid,
        totalPending,
        activePayments,
        completedPayments,
        totalPayments: payments.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to generate statistics: ${error.message}`,
      );
    }
  }
}
