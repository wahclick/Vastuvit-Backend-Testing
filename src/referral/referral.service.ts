import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Referral, ReferralDocument } from './schema/referral.schema';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';
import { QueryReferralDto } from './dto/query-referral.dto';

@Injectable()
export class ReferralService {
  constructor(
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
  ) {}

  async createReferral(
    createReferralDto: CreateReferralDto,
  ): Promise<Referral> {
    // Check for existing referral with same email or phone
    const existingReferral = await this.referralModel.findOne({
      firm_id: createReferralDto.firm_id,
      $or: [
        { email: createReferralDto.email },
        { telephone: createReferralDto.telephone },
      ],
    });

    if (existingReferral) {
      throw new ConflictException(
        'Referral with this email or phone already exists',
      );
    }

    const referral = new this.referralModel(createReferralDto);
    return referral.save();
  }

  async findReferralsByFirm(firmId: string) {
    const referrals = await this.referralModel
      .find({ firm_id: firmId })
      .populate('user_id', 'name email')
      .populate('firm_id', 'name')
      .populate('project_id', 'name status')
      .sort({ createdAt: -1 })
      .exec();

    return referrals;
  }

  async findReferralById(id: string): Promise<Referral> {
    const referral = await this.referralModel
      .findById(id)
      .populate('user_id', 'name email')
      .populate('firm_id', 'name logo address')
      .populate('project_id', 'name status value')
      .exec();

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    return referral;
  }

  async updateReferral(
    id: string,
    updateReferralDto: UpdateReferralDto,
  ): Promise<Referral> {
    // Check for conflicts if email or phone is being updated
    if (updateReferralDto.email || updateReferralDto.telephone) {
      const existingReferral = await this.referralModel.findOne({
        _id: { $ne: id },
        firm_id: updateReferralDto.firm_id,
        $or: [
          ...(updateReferralDto.email
            ? [{ email: updateReferralDto.email }]
            : []),
          ...(updateReferralDto.telephone
            ? [{ telephone: updateReferralDto.telephone }]
            : []),
        ],
      });

      if (existingReferral) {
        throw new ConflictException(
          'Referral with this email or phone already exists',
        );
      }
    }

    const referral = await this.referralModel
      .findByIdAndUpdate(
        id,
        { $set: updateReferralDto },
        { new: true, runValidators: true },
      )
      .populate('user_id firm_id project_id')
      .exec();

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    return referral;
  }

  async deleteReferral(id: string): Promise<void> {
    const referral = await this.referralModel.findById(id);

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    // Hard delete
    await this.referralModel.findByIdAndDelete(id);
  }

  async findReferralsByProject(projectId: string): Promise<Referral[]> {
    return this.referralModel.find({ project_id: projectId }).exec();
  }

  async updateReferralStatus(id: string, status: string): Promise<Referral> {
    const referral = await this.referralModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    return referral;
  }

  async addProjectToReferral(
    referralId: string,
    projectId: string,
  ): Promise<Referral> {
    const referral = await this.referralModel
      .findByIdAndUpdate(
        referralId,
        { $addToSet: { project_id: projectId } },
        { new: true },
      )
      .populate('project_id')
      .exec();

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    return referral;
  }

  async calculateReferralAmount(
    referralId: string,
    projectValue: number,
  ): Promise<Referral> {
    const referral = await this.referralModel.findById(referralId);

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    const amount = (projectValue * referral.referralPercentage) / 100;

 
    referral.totalEarnings += amount;
    referral.referralAmount += amount;

    return referral.save();
  }

  async getReferralStats(firmId: string) {
    const stats = await this.referralModel.aggregate([
      { $match: { firm_id: new Types.ObjectId(firmId) } },
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: 1 },
          activeReferrals: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          totalEarnings: { $sum: '$totalEarnings' },
          averagePercentage: { $avg: '$referralPercentage' },
        },
      },
    ]);

    const statusBreakdown = await this.referralModel.aggregate([
      { $match: { firm_id: new Types.ObjectId(firmId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      overview: stats[0] || {
        totalReferrals: 0,
        activeReferrals: 0,
        totalEarnings: 0,
        averagePercentage: 0,
      },
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }

  async exportReferrals(firmId: string) {
    const referrals = await this.referralModel
      .find({ firm_id: firmId })
      .populate('user_id', 'name')
      .populate('firm_id', 'name address')
      .sort({ createdAt: -1 })
      .exec();

    return referrals.map((referral, index) => ({
      'S.No': index + 1,
      Name: referral.fullName,
      Phone: referral.telephone,
      'Additional Phone': referral.additionalTelephone || '',
      Email: referral.email,
      'Bank Name': referral.bankDetails.bankName,
      'Account Name': referral.bankDetails.accountName,
      'Account Number': referral.bankDetails.accountNumber,
      'IFSC Code': referral.bankDetails.ifscCode,
      Address: referral.address.fullAddress,
      City: referral.address.city,
      State: referral.address.state,
      Country: referral.address.country,
      'Referral Percentage': `${referral.referralPercentage}%`,
      'Total Earnings': referral.totalEarnings,
      Status: referral.status,
      
    }));
  }
}
