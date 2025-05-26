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

  async updateOfficeTiming(id: string, timingData: any): Promise<any> {
    // Add validation
    if (!id || id === 'null' || id === 'undefined') {
      throw new NotFoundException('Valid firm ID is required');
    }

    const { opening, closing, lunchStart, lunchEnd } = timingData;

    // Simple time calculations
    const openTime = new Date(opening);
    const closeTime = new Date(closing);
    const workMinutes =
      (closeTime.getTime() - openTime.getTime()) / (1000 * 60);

    let lunchMinutes = 0;
    if (lunchStart && lunchEnd) {
      const lunch1 = new Date(lunchStart);
      const lunch2 = new Date(lunchEnd);
      lunchMinutes = (lunch2.getTime() - lunch1.getTime()) / (1000 * 60);
    }

    const totalWorkMinutes = workMinutes - lunchMinutes;
    const hours = Math.floor(totalWorkMinutes / 60);
    const minutes = Math.floor(totalWorkMinutes % 60);

    // Update database
    return await this.firmsModel.findByIdAndUpdate(
      id,
      {
        office_timing: {
          hour: hours,
          min: minutes,
          timingoffice: `${hours}:${String(minutes).padStart(2, '0')}`,
          start: openTime.toLocaleTimeString(),
          end: closeTime.toLocaleTimeString(),
          lunchStart: lunchStart
            ? new Date(lunchStart).toLocaleTimeString()
            : null,
          lunchEnd: lunchEnd ? new Date(lunchEnd).toLocaleTimeString() : null,
        },
      },
      { new: true },
    );
  }

  // Get office timing
  async getOfficeTiming(id: string) {
    const firm = await this.firmsModel.findById(id);
    return firm?.office_timing || {};
  }
  async updateProfitPercentage(id: string, data: any): Promise<any> {
    if (!id || id === 'null' || id === 'undefined') {
      throw new NotFoundException('Valid firm ID is required');
    }

    const { percentage, enabled } = data;

    return await this.firmsModel.findByIdAndUpdate(
      id,
      {
        profit_settings: {
          percentage: percentage,
          enabled: enabled,
        },
      },
      { new: true },
    );
  }

  // Update threshold limit
  async updateThresholdLimit(id: string, data: any): Promise<any> {
    if (!id || id === 'null' || id === 'undefined') {
      throw new NotFoundException('Valid firm ID is required');
    }

    const { percentage, enabled } = data;

    return await this.firmsModel.findByIdAndUpdate(
      id,
      {
        threshold_settings: {
          percentage: percentage,
          enabled: enabled,
        },
      },
      { new: true },
    );
  }

  // Get profit settings
  async getProfitSettings(id: string): Promise<any> {
    const firm = await this.firmsModel.findById(id);
    if (!firm) {
      throw new NotFoundException(`Firm with id ${id} not found`);
    }
    return firm.profit_settings || { percentage: 0, enabled: false };
  }

  // Get threshold settings
  async getThresholdSettings(id: string): Promise<any> {
    const firm = await this.firmsModel.findById(id);
    if (!firm) {
      throw new NotFoundException(`Firm with id ${id} not found`);
    }
    return firm.threshold_settings || { percentage: 0, enabled: false };
  }
  async updateOvertimeSettings(id: string, data: any): Promise<any> {
    if (!id || id === 'null' || id === 'undefined') {
      throw new NotFoundException('Valid firm ID is required');
    }

    const { enabled, salaryper } = data;

    return await this.firmsModel.findByIdAndUpdate(
      id,
      {
        overtime_settings: {
          isEnabled: enabled,
          salaryper: enabled ? salaryper : 0,
        },
      },
      { new: true },
    );
  }

  // Get overtime settings
  async getOvertimeSettings(id: string): Promise<any> {
    const firm = await this.firmsModel.findById(id);
    if (!firm) {
      throw new NotFoundException(`Firm with id ${id} not found`);
    }
    return firm.overtime_settings || { isEnabled: false, salaryper: 0 };
  }

  // Update project code settings
  async updateProjectCodeSettings(id: string, data: any): Promise<any> {
    if (!id || id === 'null' || id === 'undefined') {
      throw new NotFoundException('Valid firm ID is required');
    }

    const { codeType, enabled } = data;

    return await this.firmsModel.findByIdAndUpdate(
      id,
      {
        [`project_code_settings.${codeType}`]: enabled,
      },
      { new: true },
    );
  }

  // Get project code settings
  async getProjectCodeSettings(id: string): Promise<any> {
    const firm = await this.firmsModel.findById(id);
    if (!firm) {
      throw new NotFoundException(`Firm with id ${id} not found`);
    }
    return (
      firm.project_code_settings || {
        pc: false,
        pd: false,
        pm: false,
        py: false,
        coin: false,
        clin: false,
      }
    );
  }
  async updateStatutoryHolidays(
    id: string,
    year: number,
    data: any,
  ): Promise<any> {
    if (!id || id === 'null' || id === 'undefined') {
      throw new NotFoundException('Valid firm ID is required');
    }

    const { selectedDays, saturdayOptions } = data;

    return await this.firmsModel.findByIdAndUpdate(
      id,
      {
        [`holiday_settings.${year}.statutory`]: {
          selectedDays: selectedDays || [],
          saturdayOptions: saturdayOptions || [],
        },
      },
      { new: true },
    );
  }

  // Add holiday
  async addHoliday(
    id: string,
    year: number,
    type: string,
    holidayData: any,
  ): Promise<any> {
    if (!id || id === 'null' || id === 'undefined') {
      throw new NotFoundException('Valid firm ID is required');
    }
  
    const { date, name, day } = holidayData;
    const holidayId = new Types.ObjectId().toString(); // Generate MongoDB ObjectId
  
    return await this.firmsModel.findByIdAndUpdate(
      id,
      {
        [`holiday_settings.${year}.${type}.${holidayId}`]: {
          date,
          name,
          day,
          type,
          year,
        },
      },
      { new: true },
    );
  }
  // Remove holiday
  async removeHoliday(
    id: string,
    year: number,
    type: string,
    holidayId: string,
  ): Promise<any> {
    if (!id || id === 'null' || id === 'undefined') {
      throw new NotFoundException('Valid firm ID is required');
    }

    return await this.firmsModel.findByIdAndUpdate(
      id,
      {
        $unset: { [`holiday_settings.${year}.${type}.${holidayId}`]: '' },
      },
      { new: true },
    );
  }

  // Add special working day
  async addSpecialWorkingDay(
    id: string,
    year: number,
    data: any,
  ): Promise<any> {
    if (!id || id === 'null' || id === 'undefined') {
      throw new NotFoundException('Valid firm ID is required');
    }
  
    const { date, name, day } = data;
    const specialDayId = new Types.ObjectId().toString(); // Generate MongoDB ObjectId
  
    return await this.firmsModel.findByIdAndUpdate(
      id,
      {
        [`holiday_settings.${year}.specialWorkingDays.${specialDayId}`]: {
          date,
          name,
          day,
          year,
        },
      },
      { new: true },
    );
  }
  // Remove special working day
  async removeSpecialWorkingDay(
    id: string,
    year: number,
    specialDayId: string,
  ): Promise<any> {
    if (!id || id === 'null' || id === 'undefined') {
      throw new NotFoundException('Valid firm ID is required');
    }

    return await this.firmsModel.findByIdAndUpdate(
      id,
      {
        $unset: {
          [`holiday_settings.${year}.specialWorkingDays.${specialDayId}`]: '',
        },
      },
      { new: true },
    );
  }

  // Update holiday totals
  async updateHolidayTotals(id: string, year: number, data: any): Promise<any> {
    if (!id || id === 'null' || id === 'undefined') {
      throw new NotFoundException('Valid firm ID is required');
    }

    const { totalholiday, totalworkingday } = data;

    return await this.firmsModel.findByIdAndUpdate(
      id,
      {
        [`holiday_settings.${year}.totalholiday`]: totalholiday,
        [`holiday_settings.${year}.totalworkingday`]: totalworkingday,
      },
      { new: true },
    );
  }

  // Get holidays for year
  async getHolidays(id: string, year: number): Promise<any> {
    const firm = await this.firmsModel.findById(id);
    if (!firm) {
      throw new NotFoundException(`Firm with id ${id} not found`);
    }
    return firm.holiday_settings?.[year] || {};
  }
}
