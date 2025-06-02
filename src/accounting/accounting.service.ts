// src/accounting/accounting.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Accounting, AccountingDocument } from './schemas/accounting.schema';
import { CreateAccountingDto } from './dto/create-accounting.dto';
import { UpdateAccountingDto } from './dto/update-accounting.dto';

@Injectable()
export class AccountingService {
  constructor(
    @InjectModel(Accounting.name)
    private accountingModel: Model<AccountingDocument>,
  ) {}

  async findAll(firmId: string): Promise<Accounting[]> {
    try {
      const results = await this.accountingModel
        .find({ firmId })
        .populate('projectId')
        .sort({ tentativeDate: -1 })
        .exec();

      return results;
    } catch (error) {
      console.error('Find all accounting error:', error);
      throw new InternalServerErrorException(
        'Failed to find accounting records: ' + error.message,
      );
    }
  }
  // Fixed findByFirmAndDateRange method - Safe handling of missing projectId
  async findByFirmAndDateRange(
    firmId: string,
    startDate: Date,
    endDate: Date,
    status?: string[],
  ) {
    console.log('=== Date Range Query Debug ===');
    console.log('firmId:', firmId);
    console.log('startDate:', startDate);
    console.log('endDate:', endDate);
    console.log('status:', status);

    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    // MOVE QUERY OUTSIDE TRY BLOCK
    const query: any = {
      firmId: firmId,
      tentativeDate: {
        $gte: startDate,
        $lte: adjustedEndDate,
      },
    };

    if (status && status.length > 0) {
      const statusLowerCase = status.map((s) => s.toLowerCase());
      query.status = { $in: statusLowerCase };
    }

    console.log('MongoDB Query:', JSON.stringify(query, null, 2));

    try {
      // First, let's check what we get without populate
      const rawResults = await this.accountingModel
        .find(query)
        .sort({ tentativeDate: 1 })
        .exec();

      console.log('Raw results (no populate):', rawResults.length);
      console.log(
        'Sample raw result projectId type:',
        typeof rawResults[0]?.projectId,
      );
      console.log(
        'Sample raw result projectId value:',
        rawResults[0]?.projectId,
      );

      // Now try with populate and see what happens
      const populatedResults = await this.accountingModel
        .find(query)
        .populate({
          path: 'projectId',
          model: 'Project', // Explicitly specify the model name
          select: 'projectName name project title projectCode', // Select specific fields
        })
        .sort({ tentativeDate: 1 })
        .exec();

      console.log('Populated results:', populatedResults.length);
      console.log(
        'Sample populated result projectId type:',
        typeof populatedResults[0]?.projectId,
      );
      console.log(
        'Sample populated result projectId:',
        populatedResults[0]?.projectId,
      );

      return populatedResults;
    } catch (error) {
      console.error('Find by firm and date range error:', error);

      // Fallback: return results without population if populate fails
      try {
        console.log('Fallback: returning results without populate');
        const fallbackResults = await this.accountingModel
          .find(query) // NOW QUERY IS ACCESSIBLE
          .sort({ tentativeDate: 1 })
          .exec();
        return fallbackResults;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw new InternalServerErrorException(
          'Failed to find accounting records by date range: ' + error.message,
        );
      }
    }
  }
  async create(createAccountingDto: CreateAccountingDto): Promise<Accounting> {
    try {
      const createdAccounting = new this.accountingModel(createAccountingDto);
      return await createdAccounting.save();
    } catch (error) {
      console.error('Create accounting error:', error);
      throw new InternalServerErrorException(
        'Failed to create accounting record: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<Accounting> {
    try {
      const accounting = await this.accountingModel
        .findById(id)
        .populate('projectId')
        .populate('firmId')
        .exec();

      if (!accounting) {
        throw new NotFoundException(
          `Accounting record with ID ${id} not found`,
        );
      }

      return accounting;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Find one accounting error:', error);
      throw new InternalServerErrorException(
        'Failed to find accounting record: ' + error?.message,
      );
    }
  }

  async update(
    id: string,
    updateAccountingDto: UpdateAccountingDto,
  ): Promise<Accounting> {
    try {
      const updatedAccounting = await this.accountingModel
        .findByIdAndUpdate(id, updateAccountingDto, { new: true })
        .populate('projectId')
        .exec();

      if (!updatedAccounting) {
        throw new NotFoundException(
          `Accounting record with ID ${id} not found`,
        );
      }

      return updatedAccounting;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Update accounting error:', error);
      throw new InternalServerErrorException(
        'Failed to update accounting record: ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.accountingModel.findByIdAndDelete(id).exec();

      if (!result) {
        throw new NotFoundException(
          `Accounting record with ID ${id} not found`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Remove accounting error:', error);
      throw new InternalServerErrorException(
        'Failed to remove accounting record: ' + error.message,
      );
    }
  }

  async findByProject(projectId: string): Promise<Accounting[]> {
    try {
      return this.accountingModel.find({ projectId }).exec();
    } catch (error) {
      console.error('Find by project error:', error);
      throw new InternalServerErrorException(
        'Failed to find accounting records by project: ' + error.message,
      );
    }
  }

  async updateStatus(id: string, status: string): Promise<Accounting> {
    try {
      const updatedAccounting = await this.accountingModel
        .findByIdAndUpdate(id, { status }, { new: true })
        .exec();

      if (!updatedAccounting) {
        throw new NotFoundException(
          `Accounting record with ID ${id} not found`,
        );
      }

      return updatedAccounting;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Update status error:', error);
      throw new InternalServerErrorException(
        'Failed to update status: ' + error.message,
      );
    }
  }
}
