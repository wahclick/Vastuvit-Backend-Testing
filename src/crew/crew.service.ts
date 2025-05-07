// crew.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateCrewDto } from './dto/create-crew.dto';
import { UpdateCrewDto } from './dto/update-crew.dto';
import { Crew, CrewDocument } from './schema/crew.schema';

@Injectable()
export class CrewService {
  constructor(@InjectModel('Crew') private crewModel: Model<CrewDocument>) {}

  async create(createCrewDto: CreateCrewDto): Promise<Crew> {
    try {
      const createdCrew = new this.crewModel(createCrewDto);
      return await createdCrew.save();
    } catch (error) {
      console.error('Error creating crew member:', error);
      throw new InternalServerErrorException(
        'Failed to create crew member: ' + error.message,
      );
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
}
