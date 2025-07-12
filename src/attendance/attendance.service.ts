// src/attendance/attendance.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Attendance,
  AttendanceDocument,
  AttendanceRecord,
} from './schemas/attendance.schema';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
  ) {}

  /**
   * Create a new attendance record for a crew member
   */
  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    try {
      // Extract date components to organize in the history structure
      const [day, month, year] = createAttendanceDto.date.split('-');

      // Create the attendance record
      const attendanceRecord: AttendanceRecord = {
        date: createAttendanceDto.date,
        status: createAttendanceDto.status,
        loggedIn: createAttendanceDto.loggedIn,
        loggedOut: createAttendanceDto.loggedOut || '',
      };

      // Check if firm_id and crew_id are defined before converting to ObjectId
      const firmId = createAttendanceDto.firm_id;
      const crewId = createAttendanceDto.crew_id;

      if (!firmId || !crewId) {
        throw new Error('firm_id and crew_id are required');
      }

      // Convert to ObjectId safely
      const firmObjectId =
        typeof firmId === 'string' ? new Types.ObjectId(firmId) : firmId;
      const crewObjectId =
        typeof crewId === 'string' ? new Types.ObjectId(crewId) : crewId;

      // First try to find an existing record for this crew and firm
      let attendance = await this.attendanceModel.findOne({
        firm_id: firmObjectId,
        crew_id: crewObjectId,
      });

      if (attendance) {
        // Update the existing record
        // Initialize the year if it doesn't exist
        if (!attendance.history[year]) {
          attendance.history[year] = {};
        }

        // Initialize the month if it doesn't exist
        if (!attendance.history[year][month]) {
          attendance.history[year][month] = [];
        }

        // Check if an entry for this date already exists
        const existingEntryIndex = attendance.history[year][month].findIndex(
          (entry) => entry.date === createAttendanceDto.date,
        );

        if (existingEntryIndex !== -1) {
          // Update the existing entry
          attendance.history[year][month][existingEntryIndex] =
            attendanceRecord;
        } else {
          // Add a new entry
          attendance.history[year][month].push(attendanceRecord);
        }
        attendance.markModified('history');
        const savedAttendance = await attendance.save();
        return await attendance.save();
      } else {
        // Create a new attendance document
        const newAttendance = new this.attendanceModel({
          firm_id: firmObjectId,
          crew_id: crewObjectId,
          history: {
            [year]: {
              [month]: [attendanceRecord],
            },
          },
        });

        return await newAttendance.save();
      }
    } catch (error) {
      if (error.code === 11000) {
        // Handle duplicate key error
        throw new ConflictException('Attendance record already exists');
      }
      console.error('Error creating attendance record:', error);
      throw new InternalServerErrorException(
        'Failed to create attendance record: ' + error.message,
      );
    }
  }

  /**
   * Find all attendance records for a firm
   */
  async findAllByFirm(firmId: string): Promise<Attendance[]> {
    try {
      return this.attendanceModel
        .find({ firm_id: new Types.ObjectId(firmId) })
        .populate('crew_id', 'name')
        .exec();
    } catch (error) {
      console.error('Error finding attendance records:', error);
      throw new InternalServerErrorException(
        'Failed to find attendance records: ' + error.message,
      );
    }
  }

  /**
   * Find attendance records for a specific crew member
   */
  async findByCrew(crewId: string): Promise<Attendance[]> {
    try {
      return this.attendanceModel
        .find({ crew_id: new Types.ObjectId(crewId) })
        .populate('firm_id', 'name')
        .exec();
    } catch (error) {
      console.error('Error finding attendance records:', error);
      throw new InternalServerErrorException(
        'Failed to find attendance records: ' + error.message,
      );
    }
  }

  /**
   * Find attendance record for a specific crew in a specific firm
   */
  async findByCrewAndFirm(crewId: string, firmId: string): Promise<Attendance> {
    try {
      const attendance = await this.attendanceModel
        .findOne({
          crew_id: new Types.ObjectId(crewId),
          firm_id: new Types.ObjectId(firmId),
        })
        .exec();

      if (!attendance) {
        throw new NotFoundException(
          `Attendance record not found for crew ${crewId} in firm ${firmId}`,
        );
      }

      return attendance;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error finding attendance record:', error);
      throw new InternalServerErrorException(
        'Failed to find attendance record: ' + error.message,
      );
    }
  }

  /**
   * Update an attendance record for a specific date
   */
  async update(
    crewId: string,
    firmId: string,
    date: string,
    updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<Attendance> {
    try {
      // Extract date components
      const [day, month, year] = date.split('-');

      // Find the attendance record
      const attendance = await this.attendanceModel.findOne({
        crew_id: new Types.ObjectId(crewId),
        firm_id: new Types.ObjectId(firmId),
      });

      if (!attendance) {
        throw new NotFoundException(
          `Attendance record not found for crew ${crewId} in firm ${firmId}`,
        );
      }

      // Check if the history structure exists
      if (!attendance.history[year] || !attendance.history[year][month]) {
        throw new NotFoundException(`No attendance records found for ${date}`);
      }

      // Find the specific date record
      const recordIndex = attendance.history[year][month].findIndex(
        (record) => record.date === date,
      );

      if (recordIndex === -1) {
        throw new NotFoundException(`No attendance record found for ${date}`);
      }

      // Update the record
      if (updateAttendanceDto.status) {
        attendance.history[year][month][recordIndex].status =
          updateAttendanceDto.status;
      }

      if (updateAttendanceDto.loggedIn) {
        attendance.history[year][month][recordIndex].loggedIn =
          updateAttendanceDto.loggedIn;
      }

      if (updateAttendanceDto.loggedOut) {
        attendance.history[year][month][recordIndex].loggedOut =
          updateAttendanceDto.loggedOut;
      }
      attendance.markModified('history');
      const savedAttendance = await attendance.save();
      return await attendance.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating attendance record:', error);
      throw new InternalServerErrorException(
        'Failed to update attendance record: ' + error.message,
      );
    }
  }

  /**
   * Get attendance for a specific month
   */
  async getMonthlyAttendance(
    crewId: string,
    firmId: string,
    year: string,
    month: string,
  ): Promise<AttendanceRecord[]> {
    try {
      const attendance = await this.attendanceModel.findOne({
        crew_id: new Types.ObjectId(crewId),
        firm_id: new Types.ObjectId(firmId),
      });

      if (!attendance) {
        return [];
      }

      if (!attendance.history[year] || !attendance.history[year][month]) {
        return [];
      }

      return attendance.history[year][month];
    } catch (error) {
      console.error('Error getting monthly attendance:', error);
      throw new InternalServerErrorException(
        'Failed to get monthly attendance: ' + error.message,
      );
    }
  }

  /**
   * Record login (clock in)
   */
  async clockIn(
    crewId: string,
    firmId: string,
    date: string,
    time: string,
  ): Promise<Attendance> {
    try {
      // Create DTO for a new attendance record
      const createDto: CreateAttendanceDto = {
        crew_id: crewId,
        firm_id: firmId,
        date: date,
        status: 'present',
        loggedIn: time,
      };

      return await this.create(createDto);
    } catch (error) {
      console.error('Error recording clock in:', error);
      throw new InternalServerErrorException(
        'Failed to record clock in: ' + error.message,
      );
    }
  }

  /**
   * Record logout (clock out)
   */
  async clockOut(
    crewId: string,
    firmId: string,
    date: string,
    time: string,
  ): Promise<Attendance> {
    try {
      // Extract date components
      const [day, month, year] = date.split('-');

      // Find the attendance record
      const attendance = await this.attendanceModel.findOne({
        crew_id: new Types.ObjectId(crewId),
        firm_id: new Types.ObjectId(firmId),
      });

      if (!attendance) {
        throw new NotFoundException(
          `No attendance record found for crew ${crewId}`,
        );
      }

      // Make sure the history structure exists
      if (!attendance.history[year]) {
        attendance.history[year] = {};
      }

      if (!attendance.history[year][month]) {
        attendance.history[year][month] = [];
      }

      // Find the specific date record
      const recordIndex = attendance.history[year][month].findIndex(
        (record) => record.date === date,
      );

      if (recordIndex === -1) {
        // No clock-in record found, create a new one
        attendance.history[year][month].push({
          date: date,
          status: 'present',
          loggedIn: time, // If no clock-in, use the same time
          loggedOut: time,
        });
      } else {
        // Update the existing record with logout time
        attendance.history[year][month][recordIndex].loggedOut = time;
      }
      attendance.markModified('history');
      const savedAttendance = await attendance.save();
      return await attendance.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error recording clock out:', error);
      throw new InternalServerErrorException(
        'Failed to record clock out: ' + error.message,
      );
    }
  }

  /**
   * Get attendance summary for a crew member
   */
  async getAttendanceSummary(
    crewId: string,
    firmId: string,
    year: string,
    month?: string,
  ): Promise<any> {
    try {
      const attendance = await this.attendanceModel.findOne({
        crew_id: new Types.ObjectId(crewId),
        firm_id: new Types.ObjectId(firmId),
      });

      if (!attendance || !attendance.history[year]) {
        return {
          present: 0,
          absent: 0,
          late: 0,
          leave: 0,
          holiday: 0,
          total: 0,
        };
      }

      let records: AttendanceRecord[] = [];

      // If month is specified, get records for that month
      if (month) {
        if (!attendance.history[year][month]) {
          return {
            present: 0,
            absent: 0,
            late: 0,
            leave: 0,
            holiday: 0,
            total: 0,
          };
        }
        records = attendance.history[year][month];
      } else {
        // Get all records for the year
        Object.keys(attendance.history[year]).forEach((m) => {
          records = records.concat(attendance.history[year][m]);
        });
      }

      // Count the status occurrences
      const summary = {
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        holiday: 0,
        total: records.length,
      };

      records.forEach((record) => {
        summary[record.status]++;
      });

      return summary;
    } catch (error) {
      console.error('Error getting attendance summary:', error);
      throw new InternalServerErrorException(
        'Failed to get attendance summary: ' + error.message,
      );
    }
  }
}
