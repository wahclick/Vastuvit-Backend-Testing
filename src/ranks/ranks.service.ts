import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Rank, RankDocument } from './schema/ranks.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';

@Injectable()
export class RanksService {
  constructor(@InjectModel(Rank.name) private rankModel: Model<RankDocument>) {}

  async create(createRankDto: CreateRankDto): Promise<Rank> {
    const createdRank = new this.rankModel(createRankDto);
    return createdRank.save();
  }

  async findAll(firmId: Types.ObjectId | string): Promise<Rank[]> {
    return this.rankModel.find({ firmId }).exec();
  }

  async findOne(id: string): Promise<Rank | null> {
    return this.rankModel.findById(id).exec();
  }

  async update(id: string, updateRankDto: UpdateRankDto): Promise<Rank | null> {
    return this.rankModel
      .findByIdAndUpdate(id, updateRankDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Rank | null> {
    return this.rankModel.findById(id).exec();
  }
  async toggleEnabled(id: string): Promise<Rank | null> {
    const rank = await this.rankModel.findById(id);
    if (rank) {
      rank.isEnabled = !rank.isEnabled;
      return rank.save();
    }
    return null;
  }
}
