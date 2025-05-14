// src/leave/leave.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Leave, LeaveDocument } from './schema/leave.schema';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';

@Injectable()
export class LeaveService {
  constructor(
    @InjectModel(Leave.name) private leaveModel: Model<LeaveDocument>,
  ) {}

  async createLeave(createLeaveDto: CreateLeaveDto): Promise<LeaveDocument> {
    try {
      const newLeave = new this.leaveModel({
        ...createLeaveDto,
        firm_id: new Types.ObjectId(createLeaveDto.firm_id),
        crew_id: new Types.ObjectId(createLeaveDto.crew_id),
      });
      return await newLeave.save();
    } catch (error) {
      console.error('Create leave error:', error);
      throw new InternalServerErrorException(
        'Failed to create leave record: ' + error.message,
      );
    }
  }

  async getAllLeaves(): Promise<LeaveDocument[]> {
    return this.leaveModel.find().exec();
  }

  async getLeavesByFirmId(firmId: string): Promise<LeaveDocument[]> {
    return this.leaveModel.find({ firm_id: new Types.ObjectId(firmId) }).exec();
  }

  async getLeavesByCrewId(crewId: string): Promise<LeaveDocument[]> {
    return this.leaveModel.find({ crew_id: new Types.ObjectId(crewId) }).exec();
  }

  async getLeavesByFirmAndCrewId(
    firmId: string,
    crewId: string,
  ): Promise<LeaveDocument[]> {
    return this.leaveModel
      .find({
        firm_id: new Types.ObjectId(firmId),
        crew_id: new Types.ObjectId(crewId),
      })
      .exec();
  }

  async getLeaveById(id: string): Promise<LeaveDocument> {
    const leave = await this.leaveModel.findById(id).exec();
    if (!leave) {
      throw new NotFoundException(`Leave with id ${id} not found`);
    }
    return leave;
  }

  async updateLeave(
    id: string,
    updateLeaveDto: UpdateLeaveDto,
  ): Promise<LeaveDocument> {
    try {
      // Convert string IDs to ObjectIds if they exist in the DTO
      const updateData: any = { ...updateLeaveDto };
      if (updateLeaveDto.firm_id) {
        updateData.firm_id = new Types.ObjectId(updateLeaveDto.firm_id);
      }
      if (updateLeaveDto.crew_id) {
        updateData.crew_id = new Types.ObjectId(updateLeaveDto.crew_id);
      }
      if (updateLeaveDto.approved_by) {
        updateData.approved_by = new Types.ObjectId(updateLeaveDto.approved_by);
      }

      // If status is being set to approved, set approved_at to now
      if (updateLeaveDto.status === 'approved') {
        updateData.approved_at = new Date();
      }

      const updatedLeave = await this.leaveModel
        .findByIdAndUpdate(id, { $set: updateData }, { new: true })
        .exec();

      if (!updatedLeave) {
        throw new NotFoundException(`Leave with id ${id} not found`);
      }

      return updatedLeave;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update leave: ' + error.message,
      );
    }
  }

  async deleteLeave(id: string): Promise<void> {
    const result = await this.leaveModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Leave with id ${id} not found`);
    }
  }

  // Additional methods for leave management
  async approveLeaveRequest(
    id: string,
    managerId: string,
  ): Promise<LeaveDocument> {
    return this.updateLeave(id, {
      status: 'approved',
      approved_by: managerId,
    });
  }

  async rejectLeaveRequest(
    id: string,
    managerId: string,
    reason: string,
  ): Promise<LeaveDocument> {
    return this.updateLeave(id, {
      status: 'rejected',
      approved_by: managerId,
      rejection_reason: reason,
    });
  }
}
