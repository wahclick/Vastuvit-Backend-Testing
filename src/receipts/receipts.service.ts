
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateReceiptItemDto } from './dto/create-receipt-item.dto';
import { Receipt, ReceiptDocument } from './schemas/receipt.schema';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';


@Injectable()
export class ReceiptsService {
  constructor(
    @InjectModel('Receipt') private receiptModel: Model<ReceiptDocument>,
    @InjectModel('Client') private clientModel: Model<any>,
    @InjectModel('Project') private projectModel: Model<any>,
    @InjectModel('Firms') private firmsModel: Model<any>,
  ) {}

   async generateReceiptNumber(firmId: string): Promise<string> {
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
    
    // Count existing receipts for this firm in current financial year
    const count = await this.receiptModel.countDocuments({
      firmId: new Types.ObjectId(firmId),
      receiptNumber: { $regex: `-R/${fiscalYear}/` }
    });
    
    const receiptNumber = String(count + 1).padStart(2, '0');
    return `${prefix}-R/${fiscalYear}/${receiptNumber}`;
  }

  private calculateReceiptTotal(items: CreateReceiptItemDto[]): number {
    return items.reduce((sum, item) => sum + item.amount, 0);
  }

  async create(createReceiptDto: CreateReceiptDto): Promise<Receipt> {
    // Validate client exists
    const client = await this.clientModel.findById(createReceiptDto.clientId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Validate project exists and belongs to client
    const project = await this.projectModel.findById(createReceiptDto.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.clientId.toString() !== createReceiptDto.clientId) {
      throw new BadRequestException('Project does not belong to the selected client');
    }

    // Validate firm exists
    const firm = await this.firmsModel.findById(createReceiptDto.firmId);
    if (!firm) {
      throw new NotFoundException('Firm not found');
    }

    // Generate receipt number
    const receiptNumber = await this.generateReceiptNumber(createReceiptDto.firmId);

    // Calculate total amount
    const totalAmount = this.calculateReceiptTotal(createReceiptDto.items);

    // Create receipt
    const receipt = new this.receiptModel({
      ...createReceiptDto,
      clientName: client.name,
      clientGSTIN: client.gstin || '',
      projectName: project.name,
      clientAddress: client.address || '',
      receiptNumber,
      totalAmount,
      firmId: new Types.ObjectId(createReceiptDto.firmId),
      clientId: new Types.ObjectId(createReceiptDto.clientId),
      projectId: new Types.ObjectId(createReceiptDto.projectId),
      createdBy: new Types.ObjectId(createReceiptDto.createdBy),
    });

    return receipt.save();
  }

  async findAll(firmId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    
    const [receipts, total] = await Promise.all([
      this.receiptModel
        .find({ firmId: new Types.ObjectId(firmId), isActive: true })
        .populate('clientId', 'name gstin address')
        .populate('projectId', 'name projectCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.receiptModel.countDocuments({ firmId: new Types.ObjectId(firmId), isActive: true })
    ]);

    return {
      receipts,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
      },
    };
  }

  async findOne(id: string): Promise<Receipt> {
    const receipt = await this.receiptModel
      .findById(id)
      .populate('clientId', 'name gstin address email mobileNumber')
      .populate('projectId', 'name projectCode address')
      .populate('firmId', 'name address')
      .exec();

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    return receipt;
  }

  async update(id: string, updateReceiptDto: UpdateReceiptDto): Promise<Receipt> {
    const receipt = await this.receiptModel.findById(id);
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    // Recalculate total if items changed
    if (updateReceiptDto.items) {
      const totalAmount = this.calculateReceiptTotal(updateReceiptDto.items);
      updateReceiptDto['totalAmount'] = totalAmount;
    }

    const updatedReceipt = await this.receiptModel
      .findByIdAndUpdate(id, updateReceiptDto, { new: true })
      .populate('clientId', 'name gstin address')
      .populate('projectId', 'name projectCode')
      .exec();

    if (!updatedReceipt) {
      throw new NotFoundException('Receipt not found');
    }

    return updatedReceipt;
  }

  async remove(id: string): Promise<void> {
    const receipt = await this.receiptModel.findById(id);
    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    await this.receiptModel.findByIdAndUpdate(id, { isActive: false });
  }

  async updateStatus(id: string, status: string): Promise<Receipt> {
    const validStatuses = ['DRAFT', 'RECEIVED', 'PROCESSED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const updatedReceipt = await this.receiptModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('clientId', 'name gstin address')
      .populate('projectId', 'name projectCode')
      .exec();

    if (!updatedReceipt) {
      throw new NotFoundException('Receipt not found');
    }

    return updatedReceipt;
  }

  async findByClient(clientId: string): Promise<Receipt[]> {
    return this.receiptModel
      .find({ clientId: new Types.ObjectId(clientId), isActive: true })
      .populate('projectId', 'name projectCode')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByProject(projectId: string): Promise<Receipt[]> {
    return this.receiptModel
      .find({ projectId: new Types.ObjectId(projectId), isActive: true })
      .populate('clientId', 'name gstin')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getReceiptStats(firmId: string): Promise<any> {
    const stats = await this.receiptModel.aggregate([
      { $match: { firmId: new Types.ObjectId(firmId), isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalReceipts = await this.receiptModel.countDocuments({
      firmId: new Types.ObjectId(firmId),
      isActive: true,
    });

    return {
      totalReceipts,
      statusBreakdown: stats,
    };
  }
}