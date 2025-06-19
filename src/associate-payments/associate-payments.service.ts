// src/associate-payments/associate-payments.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model, Types } from 'mongoose';
  import {
    AssociatePayment,
    AssociatePaymentDocument,
  } from './schemas/associate-payment.schema';
  import {
    CreateAssociatePaymentDto,
    AddAssociatePaymentDto,
    QueryAssociatePaymentDto,
  } from './dto';
  
  @Injectable()
  export class AssociatePaymentsService {
    constructor(
      @InjectModel(AssociatePayment.name)
      private associatePaymentModel: Model<AssociatePaymentDocument>,
      @InjectModel('Associate')
      private associateModel: Model<any>,
      @InjectModel('Project')
      private projectModel: Model<any>,
    ) {}
  
    // Create a new associate payment record
    async create(
      createAssociatePaymentDto: CreateAssociatePaymentDto,
    ): Promise<AssociatePaymentDocument> {
      try {
        // Check if associate payment already exists for this project-associate combination
        const existingPayment = await this.associatePaymentModel.findOne({
          associateId: createAssociatePaymentDto.associateId,
          projectId: createAssociatePaymentDto.projectId,
        });
  
        if (existingPayment) {
          throw new BadRequestException(
            'Associate payment record already exists for this project',
          );
        }
  
        const createdPayment = new this.associatePaymentModel(
          createAssociatePaymentDto,
        );
        return await createdPayment.save();
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new InternalServerErrorException(
          `Failed to create associate payment: ${error.message}`,
        );
      }
    }
  
    // Get associate payments by associate ID
    async findByAssociate(associateId: string): Promise<AssociatePayment[]> {
      try {
        if (!Types.ObjectId.isValid(associateId)) {
          throw new BadRequestException('Invalid associate ID format');
        }
  
        const payments = await this.associatePaymentModel
          .find({ associateId: new Types.ObjectId(associateId), isEnabled: true })
          .populate('projectId', 'name status')
          .populate('associateId', 'fullName telephone type')
          .exec();
  
        return payments;
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new InternalServerErrorException(
          `Failed to fetch associate payments: ${error.message}`,
        );
      }
    }
  
    // Get specific associate payment by project and associate
    async findByProjectAndAssociate(
      projectId: string,
      associateId: string,
    ): Promise<AssociatePaymentDocument> {
      try {
        if (
          !Types.ObjectId.isValid(projectId) ||
          !Types.ObjectId.isValid(associateId)
        ) {
          throw new BadRequestException(
            'Invalid project ID or associate ID format',
          );
        }
  
        const payment = await this.associatePaymentModel
          .findOne({
            projectId: new Types.ObjectId(projectId),
            associateId: new Types.ObjectId(associateId),
            isEnabled: true,
          })
          .populate('projectId', 'name status')
          .populate('associateId', 'fullName telephone type')
          .exec();
  
        if (!payment) {
          throw new NotFoundException('Associate payment record not found');
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
          `Failed to fetch associate payment: ${error.message}`,
        );
      }
    }
  
    // Add payment to history - auto-create if not exists
    async addPayment(
      projectId: string,
      associateId: string,
      addAssociatePaymentDto: AddAssociatePaymentDto,
    ): Promise<AssociatePaymentDocument> {
      try {
        let payment: AssociatePaymentDocument;
  
        // Try to find existing payment record
        try {
          payment = await this.findByProjectAndAssociate(projectId, associateId);
        } catch (error) {
          if (error instanceof NotFoundException) {
            // Auto-create the associate payment record if it doesn't exist
            console.log('Associate payment record not found, creating new one...');
  
            // Fetch associate and project details
            const associate = await this.associateModel.findById(associateId);
            const project = await this.projectModel.findById(projectId);
  
            if (!associate) {
              throw new NotFoundException('Associate not found');
            }
            if (!project) {
              throw new NotFoundException('Project not found');
            }
  
            // Find the project assignment in associate's projectAssignments
            const projectAssignment = associate.projectAssignments.find(
              (assignment: any) => 
                assignment.projectId.toString() === projectId && assignment.isActive
            );
  
            if (!projectAssignment) {
              throw new NotFoundException(
                'Associate is not assigned to this project',
              );
            }
  
            // Create payment record using assignment data
            const createData: CreateAssociatePaymentDto = {
              associateId: new Types.ObjectId(associateId),
              projectId: new Types.ObjectId(projectId),
              userId: associate.user_id,
              firmId: associate.firm_id,
              projectName: project.name,
              associateName: associate.fullName,
              associateType: associate.type,
              totalProjectAmount: projectAssignment.totalAmount,
              areaSqMtr: projectAssignment.areaSqMtr,
              areaSqFt: projectAssignment.areaSqFt,
              rate: projectAssignment.rate,
              projectRemarks: projectAssignment.remarks,
            };
  
            payment = await this.create(createData);
            console.log('Associate payment record created successfully');
          } else {
            throw error;
          }
        }
  
        // Now proceed with adding the payment
        const newTotalPaid = payment.totalPaidAmount + addAssociatePaymentDto.amount;
        const remainingBalance = payment.totalProjectAmount - newTotalPaid;
  
        if (newTotalPaid > payment.totalProjectAmount) {
          throw new BadRequestException(
            'Payment amount exceeds total project amount',
          );
        }
  
        if (addAssociatePaymentDto.amount <= 0) {
          throw new BadRequestException(
            'Payment amount must be greater than zero',
          );
        }
  
        const paymentHistoryItem = {
          _id: new Types.ObjectId(),
          amount: addAssociatePaymentDto.amount,
          paymentDate: new Date(addAssociatePaymentDto.paymentDate),
          paymentMode: addAssociatePaymentDto.paymentMode,
          balance: remainingBalance,
          remarks: addAssociatePaymentDto.remarks,
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
    async getPaymentHistory(projectId: string, associateId: string) {
      try {
        const payment = await this.findByProjectAndAssociate(
          projectId,
          associateId,
        );
  
        // Sort payment history by date (most recent first)
        const sortedHistory = payment.paymentHistory.sort(
          (a, b) =>
            new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
        );
  
        return {
          projectName: payment.projectName,
          associateName: payment.associateName,
          associateType: payment.associateType,
          totalProjectAmount: payment.totalProjectAmount,
          totalPaidAmount: payment.totalPaidAmount,
          remainingBalance: payment.totalProjectAmount - payment.totalPaidAmount,
          areaSqMtr: payment.areaSqMtr,
          areaSqFt: payment.areaSqFt,
          rate: payment.rate,
          projectRemarks: payment.projectRemarks,
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
      associateId: string,
      paymentId: string,
    ): Promise<AssociatePaymentDocument> {
      try {
        if (!Types.ObjectId.isValid(paymentId)) {
          throw new BadRequestException('Invalid payment ID format');
        }
  
        const payment = await this.findByProjectAndAssociate(
          projectId,
          associateId,
        );
  
        const paymentIndex = payment.paymentHistory.findIndex(
          (p) => p._id.toString() === paymentId,
        );
  
        if (paymentIndex === -1) {
          throw new NotFoundException('Payment not found in history');
        }
  
        payment.paymentHistory.splice(paymentIndex, 1);
  
        // Recalculate totals
        payment.totalPaidAmount = payment.paymentHistory.reduce(
          (sum, p) => sum + p.amount,
          0,
        );
  
        // Update balances for all remaining payments
        let runningBalance = payment.totalProjectAmount;
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
          payment.totalPaidAmount === payment.totalProjectAmount
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
  
    // Get all associate payments for a firm
    async findByFirm(
        firmId: string,
        query?: QueryAssociatePaymentDto,
      ): Promise<AssociatePayment[]> {
        try {
          // Don't validate ObjectId for firmId since it's stored as string
          const filter: any = {
            firmId: firmId, // Use string directly instead of new Types.ObjectId(firmId)
            isEnabled: true,
          };
      
          if (query?.status) {
            filter.status = query.status;
          }
          if (query?.associateId) {
            if (!Types.ObjectId.isValid(query.associateId)) {
              throw new BadRequestException('Invalid associate ID format in query');
            }
            filter.associateId = new Types.ObjectId(query.associateId);
          }
          if (query?.projectId) {
            if (!Types.ObjectId.isValid(query.projectId)) {
              throw new BadRequestException('Invalid project ID format in query');
            }
            filter.projectId = new Types.ObjectId(query.projectId);
          }
          if (query?.associateType) {
            filter.associateType = query.associateType;
          }
      
          console.log('🔍 Filter for associate payments:', filter); // Debug log
      
          const payments = await this.associatePaymentModel
            .find(filter)
            .populate('projectId', 'name status')
            .populate('associateId', 'fullName telephone type')
            .sort({ createdAt: -1 })
            .exec();
      
          console.log('📊 Found associate payments:', payments.length); // Debug log
      
          return payments;
        } catch (error) {
          console.error('❌ Error in findByFirm:', error); // Debug log
          if (error instanceof BadRequestException) {
            throw error;
          }
          throw new InternalServerErrorException(
            `Failed to fetch firm associate payments: ${error.message}`,
          );
        }
      }
  
    // Get summary statistics
    async getStatistics(firmId: string) {
      try {
        if (!Types.ObjectId.isValid(firmId)) {
          throw new BadRequestException('Invalid firm ID format');
        }
  
        const payments = await this.associatePaymentModel
          .find({ firmId: new Types.ObjectId(firmId), isEnabled: true })
          .exec();
  
        const totalOwed = payments.reduce(
          (sum, p) => sum + p.totalProjectAmount,
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
        const onHoldPayments = payments.filter(
          (p) => p.status === 'ON_HOLD',
        ).length;
  
        // Group by associate type
        const byType = payments.reduce((acc, payment) => {
          const type = payment.associateType;
          if (!acc[type]) {
            acc[type] = {
              count: 0,
              totalOwed: 0,
              totalPaid: 0,
            };
          }
          acc[type].count++;
          acc[type].totalOwed += payment.totalProjectAmount;
          acc[type].totalPaid += payment.totalPaidAmount;
          return acc;
        }, {});
  
        return {
          totalOwed,
          totalPaid,
          totalPending,
          activePayments,
          completedPayments,
          onHoldPayments,
          totalPayments: payments.length,
          byAssociateType: byType,
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