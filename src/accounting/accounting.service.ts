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
interface ProjectFilters {
  paymentType?: string;
  expenseType?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}
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
  async findByProjectWithFilters(projectId: string, filters: ProjectFilters): Promise<Accounting[]> {
    try {
      console.log('=== findByProjectWithFilters Debug ===');
      console.log('Raw projectId:', projectId);
      console.log('Filters:', filters);
      
      // FIX: Use string projectId instead of ObjectId conversion
      const query: any = { projectId: projectId };
      
      console.log('Base query with string projectId:', query);
      
      // Add filters if provided
      if (filters.paymentType) {
        query.paymentType = filters.paymentType;
        console.log('Added paymentType filter:', filters.paymentType);
      }
      
      if (filters.expenseType) {
        query.expenseType = filters.expenseType;
        console.log('Added expenseType filter:', filters.expenseType);
      }
      
      if (filters.status) {
        query.status = filters.status;
        console.log('Added status filter:', filters.status);
      }
      
      // Date range filtering
      if (filters.startDate || filters.endDate) {
        query.tentativeDate = {};
        if (filters.startDate) {
          query.tentativeDate.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.tentativeDate.$lte = filters.endDate;
        }
        console.log('Added date filter:', query.tentativeDate);
      }
  
      console.log('Final MongoDB query:', JSON.stringify(query, null, 2));
      
      const result = await this.accountingModel
        .find(query)
        .sort({ tentativeDate: -1 })
        .exec();
      
      console.log('Query result count:', result.length);
      console.log('Sample result:', result[0]);
      
      return result;
    } catch (error) {
      console.error('findByProjectWithFilters error:', error);
      throw new InternalServerErrorException(
        'Failed to find accounting records with filters: ' + error.message,
      );
    }
  }
  async debugProjectQuery(projectId: string): Promise<any> {
    console.log('=== DEBUG PROJECT QUERY ===');
    
    // Test 1: Find by string projectId
    const stringQuery = { projectId: projectId };
    console.log('String query:', stringQuery);
    const stringResult = await this.accountingModel.find(stringQuery).exec();
    console.log('String query result count:', stringResult.length);
    
    // Test 2: Find by ObjectId
    const objectIdQuery = { projectId: new Types.ObjectId(projectId) };
    console.log('ObjectId query:', objectIdQuery);
    const objectIdResult = await this.accountingModel.find(objectIdQuery).exec();
    console.log('ObjectId query result count:', objectIdResult.length);
    
    // Test 3: Find all records and check structure
    const allRecords = await this.accountingModel.find().limit(1).exec();
    console.log('Sample record structure:', allRecords[0]);
    console.log('Sample record projectId type:', typeof allRecords[0]?.projectId);
    console.log('Sample record projectId value:', allRecords[0]?.projectId);
    
    // Test 4: Check if field exists with different name
    const anyProjectQuery = { 
      $or: [
        { projectId: projectId },
        { projectId: new Types.ObjectId(projectId) },
        { project_id: projectId },
        { project_id: new Types.ObjectId(projectId) }
      ]
    };
    const anyProjectResult = await this.accountingModel.find(anyProjectQuery).exec();
    console.log('Any project field result count:', anyProjectResult.length);
    
    return {
      stringResult: stringResult.length,
      objectIdResult: objectIdResult.length,
      anyProjectResult: anyProjectResult.length,
      sampleRecord: allRecords[0]
    };
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
      return this.accountingModel.find({ projectId }).exec(); // Already correct - no ObjectId conversion
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
