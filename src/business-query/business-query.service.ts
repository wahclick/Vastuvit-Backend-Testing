import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateBusinessQueryDto } from './dto/create-business-query.dto';
import { BusinessQuery, BusinessQueryDocument } from './schema/business-query.schema';
import { UpdateBusinessQueryDto } from './dto/update-business-query.dto';
import { BusinessQueryStatus } from './enum/business-query-status.enum';
import { CreateQueryHistoryDto } from './dto/create-query-history.dto';

@Injectable()
export class BusinessQueryService {
  constructor(
    @InjectModel(BusinessQuery.name)
    private businessQueryModel: Model<BusinessQueryDocument>,
  ) {}

  async create(createBusinessQueryDto: CreateBusinessQueryDto): Promise<BusinessQuery> {
    const createdBusinessQuery = new this.businessQueryModel(createBusinessQueryDto);
    return createdBusinessQuery.save();
  }

  async findAll(): Promise<BusinessQuery[]> {
    return this.businessQueryModel
      .find({ isEnabled: true })
      .populate('userId')
      .populate('firmId')
      .populate('clientId')
      .populate('referralId')
      .exec();
  }

  async findOne(id: string): Promise<BusinessQuery> {
    const businessQuery = await this.businessQueryModel
      .findById(id)
      .populate('userId')
      .populate('firmId')
      .populate('clientId')
      .populate('referralId')
      .exec();

    if (!businessQuery) {
      throw new NotFoundException(`Business query with ID ${id} not found`);
    }

    return businessQuery;
  }

  async update(id: string, updateBusinessQueryDto: UpdateBusinessQueryDto): Promise<BusinessQuery> {
    const updatedBusinessQuery = await this.businessQueryModel
      .findByIdAndUpdate(id, updateBusinessQueryDto, { new: true })
      .populate('userId')
      .populate('firmId')
      .populate('clientId')
      .populate('referralId')
      .exec();

    if (!updatedBusinessQuery) {
      throw new NotFoundException(`Business query with ID ${id} not found`);
    }

    return updatedBusinessQuery;
  }

  async remove(id: string): Promise<void> {
    const result = await this.businessQueryModel.findByIdAndUpdate(
      id,
      { isEnabled: false },
      { new: true }
    );

    if (!result) {
      throw new NotFoundException(`Business query with ID ${id} not found`);
    }
  }

  async addQueryHistory(id: string, queryHistoryDto: CreateQueryHistoryDto): Promise<BusinessQuery> {
    const businessQuery = await this.businessQueryModel.findById(id);
    
    if (!businessQuery) {
      throw new NotFoundException(`Business query with ID ${id} not found`);
    }
  
    // Create the query history object with explicit _id
    const newQueryHistory = {
      _id: new Types.ObjectId(), // ← ADD THIS LINE - Explicitly generate ID
      ...queryHistoryDto,
      followUpDate: new Date(queryHistoryDto.followUpDate),
      nextFollowUpDate: new Date(queryHistoryDto.nextFollowUpDate),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  
    console.log('Adding query history with ID:', newQueryHistory._id.toString()); // Debug log
  
    businessQuery.queryHistory.push(newQueryHistory as any);
    
    // Mark the array as modified to ensure Mongoose saves it properly
    businessQuery.markModified('queryHistory');
    
    return businessQuery.save();
  }

  async getQueryHistory(id: string): Promise<any[]> {
    const businessQuery = await this.businessQueryModel.findById(id);
    
    if (!businessQuery) {
      throw new NotFoundException(`Business query with ID ${id} not found`);
    }

    return businessQuery.queryHistory;
  }

  async updateQueryHistory(id: string, historyId: string, queryHistoryDto: CreateQueryHistoryDto): Promise<BusinessQuery> {
    const businessQuery = await this.businessQueryModel.findById(id);
    
    if (!businessQuery) {
      throw new NotFoundException(`Business query with ID ${id} not found`);
    }

    const historyIndex = businessQuery.queryHistory.findIndex(
      history => history._id.toString() === historyId
    );

    if (historyIndex === -1) {
      throw new NotFoundException(`Query history with ID ${historyId} not found`);
    }

    businessQuery.queryHistory[historyIndex] = { 
      ...businessQuery.queryHistory[historyIndex], 
      ...queryHistoryDto,
      followUpDate: new Date(queryHistoryDto.followUpDate),
      nextFollowUpDate: new Date(queryHistoryDto.nextFollowUpDate)
    };
    
    return businessQuery.save();
  }

  async deleteQueryHistory(id: string, historyId: string): Promise<BusinessQuery> {
    const businessQuery = await this.businessQueryModel.findById(id);
    
    if (!businessQuery) {
      throw new NotFoundException(`Business query with ID ${id} not found`);
    }

    businessQuery.queryHistory = businessQuery.queryHistory.filter(
      history => history._id.toString() !== historyId
    );
    
    return businessQuery.save();
  }

  async findByUserId(userId: string): Promise<BusinessQuery[]> {
    return this.businessQueryModel
      .find({ userId, isEnabled: true })
      .populate('userId')
      .populate('firmId')
      .populate('clientId')
      .populate('referralId')
      .exec();
  }

  async findByFirmId(firmId: string): Promise<BusinessQuery[]> {
    return this.businessQueryModel
      .find({ firmId, isEnabled: true })
      .populate('userId')
      .populate('firmId')
      .populate('clientId')
      .populate('referralId')
      .exec();
  }

  async findByClientId(clientId: string): Promise<BusinessQuery[]> {
    return this.businessQueryModel
      .find({ clientId, isEnabled: true })
      .populate('userId')
      .populate('firmId')
      .populate('clientId')
      .populate('referralId')
      .exec();
  }

  async findByStatus(status: BusinessQueryStatus): Promise<BusinessQuery[]> {
    return this.businessQueryModel
      .find({ status, isEnabled: true })
      .populate('userId')
      .populate('firmId')
      .populate('clientId')
      .populate('referralId')
      .exec();
  }
}
