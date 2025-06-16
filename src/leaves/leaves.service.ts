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
import { CrewService } from 'src/crew/crew.service';

@Injectable()
export class LeaveService {
  constructor(
    @InjectModel(Leave.name) private leaveModel: Model<LeaveDocument>,
    private crewService: CrewService, // Inject CrewService
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
  async approveLeaveRequest(
    id: string,
    managerId: string,
  ): Promise<LeaveDocument> {
    // Get the leave request
    const leave = await this.leaveModel.findById(id).exec();

    if (!leave) {
      throw new NotFoundException(`Leave with id ${id} not found`);
    }

    // Calculate days
    const startDate = new Date(leave.start_date);
    const endDate = new Date(leave.end_date);
    const days = this.getDaysBetweenDates(startDate, endDate);

    // Skip balance update for leave without pay (lop)

    // Get current leave balances
    const crewId = leave.crew_id.toString();
    const crew = await this.crewService.findOne(crewId);

    // Initialize leave_balances with all required properties if it doesn't exist
    if (!crew.leave_balances) {
      crew.leave_balances = {
        el: 0,
        cl: 0,
        sl: 0,
        shl: 0,
        ml: 0,
        pl: 0,
        mgl: 0,
        bl: 0,
        lop: 0,
        co: 0,
        ph: 0,
        hl: 0, // Make sure this matches the property in your schema (lowercase or uppercase)
        lwp: 0, // Make sure this matches the property in your schema
        total: 0,
      };
    }

    // Update the specific leave balance
    const leaveType = leave.leave_type;
    const currentBalance = crew.leave_balances[leaveType] || 0;

    // Ensure balance doesn't go negative
    if (currentBalance < days) {
      throw new InternalServerErrorException(
        `Insufficient ${leaveType} balance. Available: ${currentBalance}, Required: ${days}`,
      );
    }

    // Update the leave balance
    const balanceUpdate = {
      [leaveType]: currentBalance - days,
    };

    // Save the updated balance
    await this.crewService.updateLeaveBalances(crewId, balanceUpdate);

    // Update the leave request status
    return this.updateLeave(id, {
      status: 'approved',
      approved_by: managerId,
    });
  }

  // Helper method to calculate days between dates (inclusive)
  private getDaysBetweenDates(startDate: Date, endDate: Date): number {
    // Create date copies to avoid modifying the original dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set hours to beginning of day to ensure accurate day count
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Calculate difference in milliseconds
    const diffTime = end.getTime() - start.getTime();

    // Convert to days and add 1 to include both start and end dates
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  }
}
