import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Associate, AssociateDocument } from './schema/associate.schema';
import { CreateAssociateDto } from './dto/create-associate.dto';
import { UpdateAssociateDto } from './dto/update-associate.dto';

@Injectable()
export class AssociateService {
  constructor(
    @InjectModel(Associate.name) private associateModel: Model<AssociateDocument>,
  ) {}

  async createAssociate(createAssociateDto: CreateAssociateDto): Promise<Associate> {
    const existingAssociate = await this.associateModel.findOne({
      firm_id: createAssociateDto.firm_id,
      $or: [
        { email: createAssociateDto.email },
        { telephone: createAssociateDto.telephone },
      ],
    });

    if (existingAssociate) {
      throw new ConflictException('Associate with this email or phone already exists');
    }

    const associate = new this.associateModel(createAssociateDto);
    return associate.save();
  }

  async findAssociatesByFirm(firmId: string) {
    const associates = await this.associateModel
      .find({ firm_id: firmId })
      .populate('user_id', 'name email')
      .populate('firm_id', 'name')
      .sort({ createdAt: -1 })
      .exec();

    return associates;
  }

  async findAssociateById(id: string): Promise<Associate> {
    const associate = await this.associateModel
      .findById(id)
      .populate('user_id', 'name email')
      .populate('firm_id', 'name logo address')
      .exec();

    if (!associate) {
      throw new NotFoundException('Associate not found');
    }

    return associate;
  }

  async updateAssociate(id: string, updateAssociateDto: UpdateAssociateDto): Promise<Associate> {
    if (updateAssociateDto.email || updateAssociateDto.telephone) {
      const existingAssociate = await this.associateModel.findOne({
        _id: { $ne: id },
        firm_id: updateAssociateDto.firm_id,
        $or: [
          ...(updateAssociateDto.email ? [{ email: updateAssociateDto.email }] : []),
          ...(updateAssociateDto.telephone ? [{ telephone: updateAssociateDto.telephone }] : []),
        ],
      });

      if (existingAssociate) {
        throw new ConflictException('Associate with this email or phone already exists');
      }
    }

    const associate = await this.associateModel
      .findByIdAndUpdate(id, { $set: updateAssociateDto }, { new: true, runValidators: true })
      .populate('user_id firm_id')
      .exec();

    if (!associate) {
      throw new NotFoundException('Associate not found');
    }

    return associate;
  }

  async deleteAssociate(id: string): Promise<void> {
    const associate = await this.associateModel.findById(id);

    if (!associate) {
      throw new NotFoundException('Associate not found');
    }

    await this.associateModel.findByIdAndDelete(id);
  }

  async updateAssociateStatus(id: string, status: string): Promise<Associate> {
    const associate = await this.associateModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();

    if (!associate) {
      throw new NotFoundException('Associate not found');
    }

    return associate;
  }

  async exportAssociates(firmId: string) {
    const associates = await this.associateModel
      .find({ firm_id: firmId })
      .populate('user_id', 'name')
      .populate('firm_id', 'name address')
      .sort({ createdAt: -1 })
      .exec();

    return associates.map((associate, index) => ({
      'S.No': index + 1,
      'Full Name': associate.fullName,
      'Email': associate.email,
      'Address': associate.address.fullAddress,
      'Country': associate.address.country,
      'State': associate.address.state,
      'City': associate.address.city,
      'Additional Number': associate.telephone,
      'Additional Sub Number': associate.additionalTelephone || '',
      'Bank Name': associate.bankDetails.bankName,
      'Account Name': associate.bankDetails.accountName,
      'Account Number': associate.bankDetails.accountNumber,
      'IFSC Code': associate.bankDetails.ifscCode,
      'Type': associate.type,
      'Status': associate.status,

    }));
  }
}