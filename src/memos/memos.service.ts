// src/memos/memos.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Memo, MemoDocument } from './schemas/memo.schema/memo.schema';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';

@Injectable()
export class MemosService {
  constructor(@InjectModel(Memo.name) private memoModel: Model<MemoDocument>) {}

  async createMemo(createMemoDto: CreateMemoDto): Promise<Memo> {
    try {
      const createdMemo = new this.memoModel(createMemoDto);
      return await createdMemo.save();
    } catch (error) {
      throw new BadRequestException(`Error creating memo: ${error.message}`);
    }
  }

  async getAllMemosByFirm(firmId: Types.ObjectId): Promise<Memo[]> {
    return this.memoModel
      .find({ firmId })
      .populate('userId', 'name')
      .populate('assign_to', 'name')
      .populate('assigned_by', 'name')
      .populate('projectId', 'name')
      .exec();
  }

  async getMemosByProject(projectId: Types.ObjectId): Promise<Memo[]> {
    return this.memoModel
      .find({ projectId })
      .populate('userId', 'name')
      .populate('assign_to', 'name')
      .populate('assigned_by', 'name')
      .exec();
  }

  async getMemosByAssignee(assigneeId: Types.ObjectId): Promise<Memo[]> {
    return this.memoModel
      .find({ assign_to: assigneeId })
      .populate('userId', 'name')
      .populate('assigned_by', 'name')
      .populate('projectId', 'name')
      .exec();
  }

  async getMemosByAssigner(assignerId: Types.ObjectId): Promise<Memo[]> {
    return this.memoModel
      .find({ assigned_by: assignerId })
      .populate('userId', 'name')
      .populate('assign_to', 'name')
      .populate('projectId', 'name')
      .exec();
  }

  async getMemoById(id: string): Promise<Memo> {
    const memo = await this.memoModel
      .findById(id)
      .populate('userId', 'name')
      .populate('assign_to', 'name')
      .populate('assigned_by', 'name')
      .populate('projectId', 'name')
      .exec();

    if (!memo) {
      throw new NotFoundException(`Memo with ID ${id} not found`);
    }

    return memo;
  }

  async deleteMemo(id: string): Promise<{ deleted: boolean }> {
    const result = await this.memoModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Memo with ID ${id} not found`);
    }

    return { deleted: true };
  }
}
