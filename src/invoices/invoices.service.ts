import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';


@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel('Invoice') private invoiceModel: Model<InvoiceDocument>,
    @InjectModel('Client') private clientModel: Model<any>,
    @InjectModel('Project') private projectModel: Model<any>,
    @InjectModel('Firms') private firmsModel: Model<any>,
  ) {}

   async generateInvoiceNumber(firmId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const financialYear = `${currentYear}-${nextYear}`;
    
    // Count existing invoices for this firm in current financial year
    const count = await this.invoiceModel.countDocuments({
      firmId: new Types.ObjectId(firmId),
      invoiceNumber: { $regex: `-I/${financialYear}/` }
    });
    
    const invoiceNumber = String(count + 1).padStart(2, '0');
    return `${firmId.slice(-6)}-I/${financialYear}/${invoiceNumber}`;
  }

  private calculateInvoiceAmounts(items: CreateInvoiceItemDto[], gstPercentage: number, discountPercentage: number = 0) {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = (subtotal * discountPercentage) / 100;
    const discountedAmount = subtotal - discountAmount;
    const gstAmount = (discountedAmount * gstPercentage) / 100;
    const totalAmount = discountedAmount + gstAmount;

    return {
      subtotal,
      discountAmount,
      gstAmount,
      totalAmount,
    };
  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    // Validate client exists
    const client = await this.clientModel.findById(createInvoiceDto.clientId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Validate project exists and belongs to client
    const project = await this.projectModel.findById(createInvoiceDto.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.clientId.toString() !== createInvoiceDto.clientId) {
      throw new BadRequestException('Project does not belong to the selected client');
    }

    // Validate firm exists
    const firm = await this.firmsModel.findById(createInvoiceDto.firmId);
    if (!firm) {
      throw new NotFoundException('Firm not found');
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(createInvoiceDto.firmId);

    // Calculate amounts
    const amounts = this.calculateInvoiceAmounts(
      createInvoiceDto.items,
      createInvoiceDto.gstPercentage,
      createInvoiceDto.discountPercentage || 0
    );

    // Create invoice
    const invoice = new this.invoiceModel({
      ...createInvoiceDto,
      clientName: client.name,
      clientGSTIN: client.gstin || '',
      projectName: project.name,
      clientAddress: client.address || '',
      invoiceNumber,
      ...amounts,
      firmId: new Types.ObjectId(createInvoiceDto.firmId),
      clientId: new Types.ObjectId(createInvoiceDto.clientId),
      projectId: new Types.ObjectId(createInvoiceDto.projectId),
      createdBy: new Types.ObjectId(createInvoiceDto.createdBy),
    });

    return invoice.save();
  }

  async findAll(firmId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    
    const [invoices, total] = await Promise.all([
      this.invoiceModel
        .find({ firmId: new Types.ObjectId(firmId), isActive: true })
        .populate('clientId', 'name gstin address')
        .populate('projectId', 'name projectCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.invoiceModel.countDocuments({ firmId: new Types.ObjectId(firmId), isActive: true })
    ]);

    return {
      invoices,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
      },
    };
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findById(id)
      .populate('clientId', 'name gstin address email mobileNumber')
      .populate('projectId', 'name projectCode address')
      .populate('firmId', 'name address')
      .exec();

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
  
    // Recalculate amounts if items or GST percentage changed
    if (updateInvoiceDto.items || updateInvoiceDto.gstPercentage !== undefined || updateInvoiceDto.discountPercentage !== undefined) {
      const items = updateInvoiceDto.items || invoice.items;
      const gstPercentage = updateInvoiceDto.gstPercentage !== undefined ? updateInvoiceDto.gstPercentage : invoice.gstPercentage;
      const discountPercentage = updateInvoiceDto.discountPercentage !== undefined ? updateInvoiceDto.discountPercentage : invoice.discountPercentage;
  
      const amounts = this.calculateInvoiceAmounts(items, gstPercentage, discountPercentage);
      Object.assign(updateInvoiceDto, amounts);
    }
  
    const updatedInvoice = await this.invoiceModel
      .findByIdAndUpdate(id, updateInvoiceDto, { new: true })
      .populate('clientId', 'name gstin address')
      .populate('projectId', 'name projectCode')
      .exec();
  
    // Add null check here
    if (!updatedInvoice) {
      throw new NotFoundException('Invoice not found');
    }
  
    return updatedInvoice;
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    await this.invoiceModel.findByIdAndUpdate(id, { isActive: false });
  }

  async updateStatus(id: string, status: string): Promise<Invoice> {
    const validStatuses = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const updatedInvoice = await this.invoiceModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('clientId', 'name gstin address')
      .populate('projectId', 'name projectCode')
      .exec();

    if (!updatedInvoice) {
      throw new NotFoundException('Invoice not found');
    }

    return updatedInvoice;
  }

  async findByClient(clientId: string): Promise<Invoice[]> {
    return this.invoiceModel
      .find({ clientId: new Types.ObjectId(clientId), isActive: true })
      .populate('projectId', 'name projectCode')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByProject(projectId: string): Promise<Invoice[]> {
    return this.invoiceModel
      .find({ projectId: new Types.ObjectId(projectId), isActive: true })
      .populate('clientId', 'name gstin')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getInvoiceStats(firmId: string): Promise<any> {
    const stats = await this.invoiceModel.aggregate([
      { $match: { firmId: new Types.ObjectId(firmId), isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalInvoices = await this.invoiceModel.countDocuments({
      firmId: new Types.ObjectId(firmId),
      isActive: true,
    });

    return {
      totalInvoices,
      statusBreakdown: stats,
    };
  }
}
