import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProformaInvoice, ProformaInvoiceDocument } from './schemas/proforma-invoice.schema';
import { CreateProformaInvoiceDto } from './dto/create-proforma-invoice.dto';
import { UpdateProformaInvoiceDto } from './dto/update-proforma-invoice.dto';
import { CreateProformaItemDto } from './dto/create-proforma-item.dto';
import * as moment from 'moment';

@Injectable()
export class ProformaInvoicesService {
  constructor(
    @InjectModel('ProformaInvoice') private proformaInvoiceModel: Model<ProformaInvoiceDocument>,
    @InjectModel('Client') private clientModel: Model<any>,
    @InjectModel('Project') private projectModel: Model<any>,
    @InjectModel('Firms') private firmsModel: Model<any>,
  ) {}

   async generateProformaNumber(firmId: string): Promise<string> {
    const currentYear = moment().year();
    const currentMonth = moment().month() + 1;
    const fiscalYear = currentMonth >= 4 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;
    
    const firm = await this.firmsModel.findById(firmId);
    if (!firm) {
      throw new NotFoundException('Firm not found');
    }

    let words = firm.name.split(' ').filter(word => isNaN(Number(word))).slice(0, 3);
    const prefix = words.map(word => word[0].toUpperCase()).join('');
    
    const count = await this.proformaInvoiceModel.countDocuments({
      firmId: new Types.ObjectId(firmId),
      proformaNumber: { $regex: `-PI/${fiscalYear}/` }
    });
    
    const serialNumber = String(count + 1).padStart(2, '0');
    return `${prefix}-PI/${fiscalYear}/${serialNumber}`;
  }

  private calculateProformaAmounts(items: CreateProformaItemDto[], gstPercentage: number, discountPercentage: number = 0) {
    const subtotal = items.reduce((sum, item) => sum + (item.rate * item.unit), 0);
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

  private numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertLessThanOneThousand = (n: number): string => {
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanOneThousand(n % 100) : '');
    };

    const convertLessThanOneCrore = (n: number): string => {
      if (n < 1000) return convertLessThanOneThousand(n);
      if (n < 100000) return convertLessThanOneThousand(Math.floor(n / 1000)) + ' Thousand ' + convertLessThanOneThousand(n % 1000);
      return convertLessThanOneThousand(Math.floor(n / 100000)) + ' Lakh ' + convertLessThanOneCrore(n % 100000);
    };

    if (num === 0) return 'Zero';

    let result = '';
    let crores = Math.floor(num / 10000000);
    let remainder = num % 10000000;

    if (crores > 0) {
      result += convertLessThanOneCrore(crores) + ' Crore ';
    }
    if (remainder > 0) {
      result += convertLessThanOneCrore(remainder);
    }

    return result.trim();
  }

  private amountInWords(total: number): string {
    const wholeNumber = Math.floor(total);
    const decimal = Math.round((total - wholeNumber) * 100);
    
    let result = 'Rupees ' + this.numberToWords(wholeNumber);
    
    if (decimal > 0) {
      result += ' and ' + this.numberToWords(decimal) + ' Paise';
    }
    
    return result;
  }

  async create(createProformaInvoiceDto: CreateProformaInvoiceDto): Promise<ProformaInvoice> {
    const client = await this.clientModel.findById(createProformaInvoiceDto.clientId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const project = await this.projectModel.findById(createProformaInvoiceDto.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.clientId.toString() !== createProformaInvoiceDto.clientId) {
      throw new BadRequestException('Project does not belong to the selected client');
    }

    const firm = await this.firmsModel.findById(createProformaInvoiceDto.firmId);
    if (!firm) {
      throw new NotFoundException('Firm not found');
    }

    const proformaNumber = await this.generateProformaNumber(createProformaInvoiceDto.firmId);

    const amounts = this.calculateProformaAmounts(
      createProformaInvoiceDto.items,
      createProformaInvoiceDto.gstPercentage || 0,
      createProformaInvoiceDto.discountPercentage || 0
    );

    const proformaInvoice = new this.proformaInvoiceModel({
      ...createProformaInvoiceDto,
      clientName: client.name,
      clientGSTIN: client.gstin || '',
      projectName: project.name,
      clientAddress: client.address || '',
      clientCity: client.city || '',
      clientState: client.state || '',
      clientCountry: client.country || '',
      pointOfContact: client.pointOfContact || '',
      pointOfContactAddress: client.pointOfContactAddress || '',
      proformaNumber,
      ...amounts,
      amountInWords: this.amountInWords(amounts.totalAmount),
      firmId: new Types.ObjectId(createProformaInvoiceDto.firmId),
      clientId: new Types.ObjectId(createProformaInvoiceDto.clientId),
      projectId: new Types.ObjectId(createProformaInvoiceDto.projectId),
      createdBy: new Types.ObjectId(createProformaInvoiceDto.createdBy),
    });

    return proformaInvoice.save();
  }

  async findAll(firmId: string, page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    
    const [proformaInvoices, total] = await Promise.all([
      this.proformaInvoiceModel
        .find({ firmId: new Types.ObjectId(firmId), isActive: true })
        .populate('clientId', 'name gstin address city state country pointOfContact')
        .populate('projectId', 'name projectCode address city state country')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.proformaInvoiceModel.countDocuments({ firmId: new Types.ObjectId(firmId), isActive: true })
    ]);

    return {
      proformaInvoices,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
      },
    };
  }

  async findOne(id: string): Promise<ProformaInvoice> {
    const proformaInvoice = await this.proformaInvoiceModel
      .findById(id)
      .populate('clientId', 'name gstin address email mobileNumber city state country pointOfContact pointOfContactAddress')
      .populate('projectId', 'name projectCode address city state country')
      .populate('firmId', 'name address logo city state gstin offmail')
      .exec();

    if (!proformaInvoice) {
      throw new NotFoundException('Proforma Invoice not found');
    }

    return proformaInvoice;
  }

  async update(id: string, updateProformaInvoiceDto: UpdateProformaInvoiceDto): Promise<ProformaInvoice> {
    const proformaInvoice = await this.proformaInvoiceModel.findById(id);
    if (!proformaInvoice) {
      throw new NotFoundException('Proforma Invoice not found');
    }

    if (updateProformaInvoiceDto.items || 
        updateProformaInvoiceDto.gstPercentage !== undefined || 
        updateProformaInvoiceDto.discountPercentage !== undefined) {
      
      const items = updateProformaInvoiceDto.items || proformaInvoice.items;
      const gstPercentage = updateProformaInvoiceDto.gstPercentage !== undefined ? 
        updateProformaInvoiceDto.gstPercentage : proformaInvoice.gstPercentage;
      const discountPercentage = updateProformaInvoiceDto.discountPercentage !== undefined ? 
        updateProformaInvoiceDto.discountPercentage : proformaInvoice.discountPercentage;

      const amounts = this.calculateProformaAmounts(items, gstPercentage, discountPercentage);
      Object.assign(updateProformaInvoiceDto, amounts);
      updateProformaInvoiceDto.amountInWords = this.amountInWords(amounts.totalAmount);
    }

    const updatedProformaInvoice = await this.proformaInvoiceModel
      .findByIdAndUpdate(id, updateProformaInvoiceDto, { new: true })
      .populate('clientId', 'name gstin address city state country')
      .populate('projectId', 'name projectCode address city state country')
      .exec();

    if (!updatedProformaInvoice) {
      throw new NotFoundException('Proforma Invoice not found');
    }

    return updatedProformaInvoice;
  }

  async remove(id: string): Promise<void> {
    const proformaInvoice = await this.proformaInvoiceModel.findById(id);
    if (!proformaInvoice) {
      throw new NotFoundException('Proforma Invoice not found');
    }

    await this.proformaInvoiceModel.findByIdAndUpdate(id, { isActive: false });
  }

 

  async findByClient(clientId: string): Promise<ProformaInvoice[]> {
    return this.proformaInvoiceModel
      .find({ clientId: new Types.ObjectId(clientId), isActive: true })
      .populate('projectId', 'name projectCode address city state country')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByProject(projectId: string): Promise<ProformaInvoice[]> {
    return this.proformaInvoiceModel
      .find({ projectId: new Types.ObjectId(projectId), isActive: true })
      .populate('clientId', 'name gstin address city state country')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getProformaInvoiceStats(firmId: string): Promise<any> {
    const stats = await this.proformaInvoiceModel.aggregate([
      { $match: { firmId: new Types.ObjectId(firmId), isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalProformaInvoices = await this.proformaInvoiceModel.countDocuments({
      firmId: new Types.ObjectId(firmId),
      isActive: true,
    });

    return {
      totalProformaInvoices,
      statusBreakdown: stats,
    };
  }
}