import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Firms, FirmsDocument } from './schemas/firms.schema';
import { CreateFirmDto } from './dto/create-firm.dto';
import { Model, Types } from 'mongoose';
import { UpdateLeaveSettingDto } from './dto/update-leave-seettings.dto';

@Injectable()
export class FirmsService {
  constructor(
    @InjectModel(Firms.name) private firmsModel: Model<FirmsDocument>,
  ) {}

  // Existing methods
  async create(createFirmDto: CreateFirmDto): Promise<FirmsDocument> {
    try {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(now.getDate() + 15);

      const newFirm = new this.firmsModel({
        ...createFirmDto,
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

  // Updated method for toggling a single leave setting
  async toggleLeaveSetting(
    id: string,
    updateData: UpdateLeaveSettingDto,
  ): Promise<any> {
    try {
      const { leaveType, enabled } = updateData;
      const objectId = new Types.ObjectId(id);

      // Direct update using findOneAndUpdate for atomic operation
      const result = await this.firmsModel
        .findOneAndUpdate(
          { _id: objectId },
          { $set: { [`office_leave_settings.${leaveType}`]: enabled } },
          { new: true }, // Return the updated document
        )
        .exec();

      if (!result) {
        throw new NotFoundException(`Firm with id ${id} not found`);
      }

      return result;
    } catch (error) {
      console.error('Toggle leave setting error:', error);
      throw new InternalServerErrorException(
        'Failed to toggle leave setting: ' + error.message,
      );
    }
  }

  // Method to get all leave settings
  async getLeaveSettings(id: string): Promise<any> {
    const firm = await this.firmsModel.findById(id).exec();

    if (!firm) {
      throw new NotFoundException(`Firm with id ${id} not found`);
    }

    return firm.office_leave_settings || {};
  }
}
