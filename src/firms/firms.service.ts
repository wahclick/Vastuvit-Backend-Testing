import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Firms, FirmsDocument } from './schemas/firms.schema';
import { CreateFirmDto } from './dto/create-firm.dto';
import { Model, Types } from 'mongoose';

@Injectable()
export class FirmsService {
  constructor(
    @InjectModel(Firms.name) private firmsModel: Model<FirmsDocument>,
  ) {}

  async create(createFirmDto: CreateFirmDto): Promise<FirmsDocument> {
    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(now.getDate() + 15);
  
      // Ensure you're spreading the actual createFirmDto data, not the class itself
      const newFirm = new this.firmsModel({
        ...createFirmDto, // Use createFirmDto here (the instance, not the class)
        subscriptionStartDate: now,
        subscriptionEndDate: endDate,
        plan: 'free',
      });
  
      return await newFirm.save();
    } catch (error) {
      console.error('Create firm error:', error);
      throw new InternalServerErrorException(
        'Failed to create firm record: ' + error.message,
      );
    }
  }

  async findById(id: string): Promise<FirmsDocument> {
    const firm = await this.firmsModel.findById(id).exec();
    if (!firm) {
      throw new NotFoundException(`Firm with id ${id} not found`);
    }
    return firm;
  }
  async findByOwnerId(ownerId: Types.ObjectId): Promise<FirmsDocument[]> {
    return this.firmsModel.find({ ownerId }).exec();
  }
}
