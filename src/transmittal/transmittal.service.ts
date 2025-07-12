// transmittal.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transmittal, TransmittalDocument } from './schemas/transmittal.schema';
import { CreateTransmittalDto } from './dto/create-transmittal.dto';
import { UpdateTransmittalDto } from './dto/update-transmittal.dto';
import { QueryTransmittalDto } from './dto/query-transmittal.dto';

@Injectable()
export class TransmittalService {
  constructor(
    @InjectModel(Transmittal.name) 
    private transmittalModel: Model<TransmittalDocument>,
  ) {}

  async create(createTransmittalDto: CreateTransmittalDto): Promise<Transmittal> {
    try {
      // Convert string IDs to ObjectIds
      const transmittalData = {
        ...createTransmittalDto,
        firmId: new Types.ObjectId(createTransmittalDto.firmId),
        projectId: new Types.ObjectId(createTransmittalDto.projectId),
        date: new Date(createTransmittalDto.date),
      };

      const createdTransmittal = new this.transmittalModel(transmittalData);
      return await createdTransmittal.save();
    } catch (error) {
      throw new BadRequestException(`Failed to create transmittal: ${error.message}`);
    }
  }

  async findAll(queryDto: QueryTransmittalDto = {}): Promise<Transmittal[]> {
    const filter: any = {};

    // Build filter object based on query parameters
    if (queryDto.firmId) {
      filter.firmId = new Types.ObjectId(queryDto.firmId);
    }

    if (queryDto.projectId) {
      filter.projectId = new Types.ObjectId(queryDto.projectId);
    }

    if (queryDto.status) {
      filter.status = queryDto.status;
    }

    if (queryDto.preparedby) {
      filter.preparedby = { $regex: queryDto.preparedby, $options: 'i' };
    }

    if (queryDto.transno) {
      filter.transno = { $regex: queryDto.transno, $options: 'i' };
    }

    // Date range filter
    if (queryDto.dateFrom || queryDto.dateTo) {
      filter.date = {};
      if (queryDto.dateFrom) {
        filter.date.$gte = new Date(queryDto.dateFrom);
      }
      if (queryDto.dateTo) {
        filter.date.$lte = new Date(queryDto.dateTo);
      }
    }

    return await this.transmittalModel
      .find(filter)
      .populate('firmId', 'name')
      .populate('projectId', 'name projectCode')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Transmittal> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid transmittal ID');
    }

    const transmittal = await this.transmittalModel
      .findById(id)
      .populate('firmId', 'name address contact')
      .populate('projectId', 'name projectCode clientId')
      .exec();

    if (!transmittal) {
      throw new NotFoundException(`Transmittal with ID ${id} not found`);
    }

    return transmittal;
  }

  async findByProject(projectId: string): Promise<Transmittal[]> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    return await this.transmittalModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .populate('firmId', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByFirm(firmId: string): Promise<Transmittal[]> {
    if (!Types.ObjectId.isValid(firmId)) {
      throw new BadRequestException('Invalid firm ID');
    }

    return await this.transmittalModel
      .find({ firmId: new Types.ObjectId(firmId) })
      .populate('projectId', 'name projectCode')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, updateTransmittalDto: UpdateTransmittalDto): Promise<Transmittal> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid transmittal ID');
    }
  
    const updateData: any = { ...updateTransmittalDto };
    
    // Convert string IDs to ObjectIds if provided
    if (updateTransmittalDto.firmId) {
      updateData.firmId = new Types.ObjectId(updateTransmittalDto.firmId);
    }
    if (updateTransmittalDto.projectId) {
      updateData.projectId = new Types.ObjectId(updateTransmittalDto.projectId);
    }
    if (updateTransmittalDto.date) {
      updateData.date = new Date(updateTransmittalDto.date);
    }
  
    const updatedTransmittal = await this.transmittalModel
      .findByIdAndUpdate(id, { ...updateData, updatedAt: new Date() }, { new: true })
      .populate('firmId', 'name')
      .populate('projectId', 'name projectCode')
      .exec();
  
    if (!updatedTransmittal) {
      throw new NotFoundException(`Transmittal with ID ${id} not found`);
    }
  
    return updatedTransmittal;
  }

  async updateStatus(id: string, status: string): Promise<Transmittal> {
    const validStatuses = ['Pending', 'In Progress', 'Approved', 'Rejected', 'Completed'];
    
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return await this.update(id, { status });
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid transmittal ID');
    }

    const result = await this.transmittalModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Transmittal with ID ${id} not found`);
    }

    return { message: 'Transmittal deleted successfully' };
  }

  async getTransmittalStats(firmId?: string, projectId?: string): Promise<any> {
    const matchStage: any = {};
    
    if (firmId) {
      matchStage.firmId = new Types.ObjectId(firmId);
    }
    
    if (projectId) {
      matchStage.projectId = new Types.ObjectId(projectId);
    }

    const stats = await this.transmittalModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDrawings: { $sum: { $size: '$drawings' } }
        }
      },
      {
        $group: {
          _id: null,
          statusCounts: {
            $push: {
              status: '$_id',
              count: '$count',
              totalDrawings: '$totalDrawings'
            }
          },
          totalTransmittals: { $sum: '$count' },
          totalDrawings: { $sum: '$totalDrawings' }
        }
      }
    ]);

    return stats[0] || {
      statusCounts: [],
      totalTransmittals: 0,
      totalDrawings: 0
    };
  }

  async searchTransmittals(searchTerm: string, firmId?: string): Promise<Transmittal[]> {
    const filter: any = {
      $or: [
        { transno: { $regex: searchTerm, $options: 'i' } },
        { project: { $regex: searchTerm, $options: 'i' } },
        { client: { $regex: searchTerm, $options: 'i' } },
        { preparedby: { $regex: searchTerm, $options: 'i' } },
        { 'drawings.drawno': { $regex: searchTerm, $options: 'i' } },
        { 'drawings.drawtitle': { $regex: searchTerm, $options: 'i' } }
      ]
    };

    if (firmId) {
      filter.firmId = new Types.ObjectId(firmId);
    }

    return await this.transmittalModel
      .find(filter)
      .populate('firmId', 'name')
      .populate('projectId', 'name projectCode')
      .sort({ createdAt: -1 })
      .exec();
  }
}