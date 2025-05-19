// crew.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt'; // or bcryptjs
import { CreateCrewDto } from './dto/create-crew.dto';
import { UpdateCrewDto } from './dto/update-crew.dto';
import { Crew, CrewDocument } from './schema/crew.schema';
import { DesignationsService } from 'src/designations/designations.service';
import { UpdateLeaveBalancesDto } from './dto/update-leave-balances.dto';

@Injectable()
export class CrewService {
  constructor(
    @InjectModel('Crew') private crewModel: Model<CrewDocument>,
    private designationsService: DesignationsService, // Inject the service
  ) {}

  async create(createCrewDto: CreateCrewDto): Promise<Crew> {
    try {
      // Generate employee ID
      const emp_id = await this.generateEmployeeId(createCrewDto);

      // Hash the password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createCrewDto.password, salt);

      // Create and save the crew member with emp_id and hashed password
      const createdCrew = new this.crewModel({
        ...createCrewDto,
        emp_id,
        password: hashedPassword,
      });

      return await createdCrew.save();
    } catch (error) {
      console.error('Error creating crew member:', error);
      throw new InternalServerErrorException(
        'Failed to create crew member: ' + error.message,
      );
    }
  }

  async validateByEmpId(emp_id: string, password: string): Promise<any> {
    const crew = await this.crewModel.findOne({ emp_id });
    if (!crew) return null;

    const isPasswordValid = await bcrypt.compare(password, crew.password);
    if (isPasswordValid) {
      // Return user without password
      const { password, ...result } = crew.toObject();
      return result;
    }
    return null;
  }

  // Helper method to generate employee ID
  private async generateEmployeeId(
    createCrewDto: CreateCrewDto,
  ): Promise<string> {
    try {
      // Extract name parts for prefix
      const nameParts = createCrewDto.name.split(' ');
      const namePrefix = nameParts
        .map((part) => part.substring(0, 2).toUpperCase())
        .join('');

      // Get date components
      const dateOfJoining = new Date(createCrewDto.dateOfJoining);
      const month = (dateOfJoining.getMonth() + 1).toString().padStart(2, '0');
      const year = dateOfJoining.getFullYear().toString().slice(-2);

      // Get designation abbreviation - you'll need to fetch this from your designation model
      // For simplicity, let's use a placeholder function that you can implement
      const designationTitle = await this.getDesignationTitle(
        createCrewDto.designationId,
      );
      const designationAbbreviation = designationTitle
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 4)
        .toUpperCase();

      // Create base employee ID
      const baseEmpId = `${namePrefix}${month}${year}${designationAbbreviation}`;

      // Check for duplicates and add a numeric suffix if needed
      const existingCount = await this.crewModel.countDocuments({
        emp_id: { $regex: `^${baseEmpId}` },
      });

      return existingCount > 0 ? `${baseEmpId}${existingCount + 1}` : baseEmpId;
    } catch (error) {
      console.error('Error generating employee ID:', error);
      // Fallback to a simple ID if there's an error
      return `EMP${Date.now().toString().slice(-6)}`;
    }
  }

  // Updated getDesignationTitle method
  private async getDesignationTitle(
    designationId: Types.ObjectId,
  ): Promise<string> {
    try {
      // Use the designationsService to find the designation
      const designation = await this.designationsService.findOne(
        designationId.toString(),
      );

      // Return the designation title (or label), fallback to 'DESIG' if not found
      return designation?.label || 'DESIG';
    } catch (error) {
      console.error('Error getting designation title:', error);
      return 'DESIG'; // Fallback value
    }
  }

  async findAll(firmId: Types.ObjectId | string): Promise<Crew[]> {
    try {
      return this.crewModel
        .find({ firmId })
        .populate('rankId')
        .populate('designationId')
        .exec();
    } catch (error) {
      console.error('Error finding crew members:', error);
      throw new InternalServerErrorException(
        'Failed to find crew members: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<Crew> {
    try {
      const crew = await this.crewModel
        .findById(id)
        .populate('rankId')
        .populate('designationId')
        .populate('firmId')
        .exec();

      if (!crew) {
        throw new NotFoundException(`Crew with ID ${id} not found`);
      }

      return crew;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error finding crew member:', error);
      throw new InternalServerErrorException(
        'Failed to find crew member: ' + error.message,
      );
    }
  }

  async update(id: string, updateCrewDto: UpdateCrewDto): Promise<Crew> {
    try {
      const updatedCrew = await this.crewModel
        .findByIdAndUpdate(
          id,
          {
            ...updateCrewDto,
            updatedAt: new Date(),
          },
          { new: true },
        )
        .exec();

      if (!updatedCrew) {
        throw new NotFoundException(`Crew with ID ${id} not found`);
      }

      return updatedCrew;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating crew member:', error);
      throw new InternalServerErrorException(
        'Failed to update crew member: ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.crewModel.findByIdAndDelete(id).exec();

      if (!result) {
        throw new NotFoundException(`Crew with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error removing crew member:', error);
      throw new InternalServerErrorException(
        'Failed to remove crew member: ' + error.message,
      );
    }
  }

  async findByFirmAndRank(
    firmId: Types.ObjectId | string,
    rankId: Types.ObjectId | string,
  ): Promise<Crew[]> {
    try {
      return this.crewModel
        .find({ firmId, rankId })
        .populate('designationId')
        .exec();
    } catch (error) {
      console.error('Error finding crew members by firm and rank:', error);
      throw new InternalServerErrorException(
        'Failed to find crew members by firm and rank: ' + error.message,
      );
    }
  }
  async findByName(name: string, firmId: Types.ObjectId): Promise<Crew> {
    try {
      // First try exact match
      let crew = await this.crewModel
        .findOne({
          name: name,
          firmId: firmId,
        })
        .exec();

      // If no exact match, try case-insensitive match
      if (!crew) {
        crew = await this.crewModel
          .findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            firmId: firmId,
          })
          .exec();
      }

      // If still no match, try search by email
      if (!crew && name.includes('@')) {
        crew = await this.crewModel
          .findOne({
            email: name,
            firmId: firmId,
          })
          .exec();
      }

      // Try partial match (contains)
      if (!crew) {
        crew = await this.crewModel
          .findOne({
            name: { $regex: new RegExp(name, 'i') },
            firmId: firmId,
          })
          .exec();
      }

      if (!crew) {
        throw new NotFoundException(`Crew with name ${name} not found`);
      }

      return crew;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        `Failed to find crew by name: ${error.message}`,
      );
    }
  }
  async updateLeaveBalances(
    id: string,
    updateLeaveBalancesDto: UpdateLeaveBalancesDto,
  ): Promise<Crew> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      const objectId = new Types.ObjectId(id);

      const numericBalances = {};
      Object.entries(updateLeaveBalancesDto).forEach(([key, value]) => {
        numericBalances[key] = isNaN(Number(value)) ? 0 : Number(value);
      });

      const updatedCrew = await this.crewModel
        .findByIdAndUpdate(
          objectId,
          {
            $set: {
              leave_balances: numericBalances,
              updatedAt: new Date(),
            },
          },
          { new: true },
        )
        .exec();

      if (!updatedCrew) {
        throw new NotFoundException(`Crew with ID ${id} not found`);
      }

      return updatedCrew;
    } catch (error) {
      throw error;
    }
  }
  // Get crew leave balances
  async getLeaveBalances(id: string): Promise<any> {
    try {
      const crew = await this.crewModel.findById(id).exec();

      if (!crew) {
        throw new NotFoundException(`Crew with ID ${id} not found`);
      }

      return crew.leave_balances || {};
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error getting leave balances:', error);
      throw new InternalServerErrorException(
        'Failed to get leave balances: ' + error.message,
      );
    }
  }
}
