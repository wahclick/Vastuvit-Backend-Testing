import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Voucher, VoucherDocument } from './schemas/voucher.schema';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { CreateVoucherItemDto } from './dto/create-voucher-item.dto';
import { CreateVoucherDto } from './dto/create-voucher.dto';


@Injectable()
export class VouchersService {
  constructor(
    @InjectModel('Voucher') private voucherModel: Model<VoucherDocument>,
    @InjectModel('Firms') private firmsModel: Model<any>,
  ) {}



  private async getFirmPrefix(firmId: string): Promise<string> {
    const firm = await this.firmsModel.findById(firmId);
    if (!firm) {
      throw new NotFoundException('Firm not found');
    }
    
    let words = firm.name.split(' ');
    words = words.filter(word => isNaN(Number(word)));
    words = words.slice(0, 3);
    return words.map(word => word[0].toUpperCase()).join('');
  }


  private getFiscalYear(): string {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    return currentMonth >= 4 ? 
      `${currentYear}-${currentYear + 1}` : 
      `${currentYear - 1}-${currentYear}`;
  }

   async generateVoucherNumber(firmId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const fiscalYear = currentMonth >= 4 ? 
      `${currentYear}-${currentYear + 1}` : 
      `${currentYear - 1}-${currentYear}`;
    
    // Get firm details for prefix
    const firm = await this.firmsModel.findById(firmId);
    if (!firm) {
      throw new NotFoundException('Firm not found');
    }
    
    let words = firm.name.split(' ');
    words = words.filter(word => isNaN(Number(word)));
    words = words.slice(0, 3);
    const prefix = words.map(word => word[0].toUpperCase()).join('');
    
    // Count existing vouchers for this firm in current financial year
    const count = await this.voucherModel.countDocuments({
      firmId: new Types.ObjectId(firmId),
      voucherNumber: { $regex: `-V/${fiscalYear}/` }
    });
    
    
    const voucherNumber = String(count + 1).padStart(2, '0');
    return `${prefix}-V/${fiscalYear}/${voucherNumber}`;
  }

  async getNextVoucherNumber(firmId: string): Promise<{ voucherNumber: string; nextNumber: number }> {
    const fiscalYear = this.getFiscalYear();
    const prefix = await this.getFirmPrefix(firmId);
    
    // Get the current counter without incrementing
    const counter = await this.voucherModel.findOne({
      firmId: new Types.ObjectId(firmId),
      voucherNumber: { $regex: `^${prefix}-V/${fiscalYear}/COUNTER$` }
    });
    console.log(counter);
    const nextNumber = counter ? counter.totalAmount + 1 : 1;
    const formattedNumber = String(nextNumber).padStart(2, '0');
    const voucherNumber = `${prefix}-V/${fiscalYear}/${formattedNumber}`;

    return {
      voucherNumber,
      nextNumber
    };
  }
  private calculateVoucherTotal(items: CreateVoucherItemDto[]): number {
    return items.reduce((sum, item) => sum + item.amount, 0);
  }

  async create(createVoucherDto: CreateVoucherDto): Promise<Voucher> {
    // Validate firm exists
    const firm = await this.firmsModel.findById(createVoucherDto.firmId);
    if (!firm) {
      throw new NotFoundException('Firm not found');
    }

    // Validate items array
    if (!createVoucherDto.items || createVoucherDto.items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }

    // Validate each item
    for (const item of createVoucherDto.items) {
      if (!item.description || item.description.trim() === '') {
        throw new BadRequestException('Item description cannot be empty');
      }
      if (!item.amount || item.amount <= 0) {
        throw new BadRequestException('Item amount must be greater than 0');
      }
    }

    // Generate voucher number
    const voucherNumber = await this.generateVoucherNumber(createVoucherDto.firmId);

    // Clean the items data
    const cleanedItems = createVoucherDto.items.map((item, index) => ({
      sNo: index + 1,
      description: item.description.trim(),
      amount: Number(item.amount)
    }));

    // Calculate total amount
    const totalAmount = this.calculateVoucherTotal(cleanedItems);

    // Create voucher
    const voucher = new this.voucherModel({
      ...createVoucherDto,
      items: cleanedItems,
      voucherNumber,
      totalAmount,
      firmId: new Types.ObjectId(createVoucherDto.firmId),
      createdBy: new Types.ObjectId(createVoucherDto.createdBy),
    });

    return voucher.save();
  }

  async findAll(firmId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    
    const [vouchers, total] = await Promise.all([
      this.voucherModel
        .find({ firmId: new Types.ObjectId(firmId), isActive: true })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.voucherModel.countDocuments({ firmId: new Types.ObjectId(firmId), isActive: true })
    ]);

    return {
      vouchers,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
      },
    };
  }

  async findOne(id: string): Promise<Voucher> {
    const voucher = await this.voucherModel
      .findById(id)
      .populate('createdBy', 'name email')
      .populate('firmId', 'name address')
      .exec();

    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    return voucher;
  }

  async update(id: string, updateVoucherDto: UpdateVoucherDto): Promise<Voucher> {
    const voucher = await this.voucherModel.findById(id);
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    // Create a separate object for MongoDB update
    const updateData: any = { ...updateVoucherDto };

    // Recalculate total if items changed
    if (updateVoucherDto.items) {
      // Validate items
      for (const item of updateVoucherDto.items) {
        if (!item.description || item.description.trim() === '') {
          throw new BadRequestException('Item description cannot be empty');
        }
        if (!item.amount || item.amount <= 0) {
          throw new BadRequestException('Item amount must be greater than 0');
        }
      }

      const cleanedItems = updateVoucherDto.items.map((item, index) => ({
        sNo: index + 1,
        description: item.description.trim(),
        amount: Number(item.amount),
      }));

      const totalAmount = this.calculateVoucherTotal(cleanedItems);
      updateData.items = cleanedItems;
      updateData.totalAmount = totalAmount;
    }

    const updatedVoucher = await this.voucherModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('createdBy', 'name email')
      .exec();

    if (!updatedVoucher) {
      throw new NotFoundException('Voucher not found');
    }

    return updatedVoucher;
  }

  async remove(id: string): Promise<void> {
    const voucher = await this.voucherModel.findById(id);
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    await this.voucherModel.findByIdAndUpdate(id, { isActive: false });
  }

  async findByDateRange(firmId: string, fromDate: Date, toDate: Date): Promise<Voucher[]> {
    return this.voucherModel
      .find({
        firmId: new Types.ObjectId(firmId),
        voucherDate: { $gte: fromDate, $lte: toDate },
        isActive: true,
      })
      .populate('createdBy', 'name email')
      .sort({ voucherDate: -1 })
      .exec();
  }

  async getVoucherStats(firmId: string): Promise<any> {
    const payToStats = await this.voucherModel.aggregate([
      { $match: { firmId: new Types.ObjectId(firmId), isActive: true } },
      {
        $group: {
          _id: '$payTo',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalVouchers = await this.voucherModel.countDocuments({
      firmId: new Types.ObjectId(firmId),
      isActive: true,
    });

    return {
      totalVouchers,
      payToBreakdown: payToStats,
    };
  }
} 