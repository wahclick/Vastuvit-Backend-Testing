import { Injectable } from '@nestjs/common';
import { Designation, DesignationDocument } from './schema/designations.schema';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateDesignationDto } from './dto/update-designation.dto';

@Injectable()
export class DesignationsService {
  constructor(
    @InjectModel(Designation.name)
    private designationModel: Model<DesignationDocument>,
  ) {}

  async create(
    createDesignationDto: CreateDesignationDto,
  ): Promise<Designation> {
    const createdDesignation = new this.designationModel(createDesignationDto);
    return createdDesignation.save();
  }

  async findAll(firmId: Types.ObjectId | string): Promise<Designation[]> {
    return this.designationModel.find({ firmId }).exec();
  }

  async findByRank(rankId: Types.ObjectId): Promise<Designation[]> {
    return this.designationModel.find({ rankId }).exec();
  }
  async findOne(id: string): Promise<Designation | null> {
    return this.designationModel.findById(id).exec();
  }

  async update(
    id: string,
    updateDesignationDto: UpdateDesignationDto,
  ): Promise<Designation | null> {
    return this.designationModel
      .findByIdAndUpdate(id, updateDesignationDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Designation | null> {
    return this.designationModel.findByIdAndDelete(id).exec();
  }

  async toggleEnabled(id: string): Promise<Designation | null> {
    const designation = await this.designationModel.findById(id);
    if (designation){
        designation.isEnabled = !designation.isEnabled;
        return designation.save();
    }
    return null;
   
  }
}
