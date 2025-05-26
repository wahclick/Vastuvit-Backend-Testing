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

  async findAll(firmId: string): Promise<Accounting[]> {
    try {
      return this.accountingModel
        .find({ firmId })
        .populate('projectId')
        .sort({ tentativeDate: -1 })
        .exec();
    } catch (error) {
      console.error('Find all accounting error:', error);
      throw new InternalServerErrorException(
        'Failed to find accounting records: ' + error.message,
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
        'Failed to find accounting record: ' + error.message,
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
