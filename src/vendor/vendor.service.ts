import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendor, VendorDocument } from './schema/vendor.schema';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorService {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
  ) {}

  async createVendor(createVendorDto: CreateVendorDto): Promise<Vendor> {
    const existingVendor = await this.vendorModel.findOne({
      firm_id: createVendorDto.firm_id,
      $or: [
        { email: createVendorDto.email },
        { telephone: createVendorDto.telephone },
      ],
    });

    if (existingVendor) {
      throw new ConflictException('Vendor with this email or phone already exists');
    }

    const vendor = new this.vendorModel(createVendorDto);
    return vendor.save();
  }

  async findVendorsByFirm(firmId: string) {
    const vendors = await this.vendorModel
      .find({ firm_id: firmId })
      .populate('user_id', 'name email')
      .populate('firm_id', 'name')
      .sort({ createdAt: -1 })
      .exec();

    return vendors;
  }

  async findVendorsByType(firmId: string, type: string) {
    const vendors = await this.vendorModel
      .find({ firm_id: firmId, type: type })
      .populate('user_id', 'name email')
      .populate('firm_id', 'name')
      .sort({ createdAt: -1 })
      .exec();

    return vendors;
  }

  async findVendorById(id: string): Promise<Vendor> {
    const vendor = await this.vendorModel
      .findById(id)
      .populate('user_id', 'name email')
      .populate('firm_id', 'name logo address')
      .exec();

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async updateVendor(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    if (updateVendorDto.email || updateVendorDto.telephone) {
      const existingVendor = await this.vendorModel.findOne({
        _id: { $ne: id },
        firm_id: updateVendorDto.firm_id,
        $or: [
          ...(updateVendorDto.email ? [{ email: updateVendorDto.email }] : []),
          ...(updateVendorDto.telephone ? [{ telephone: updateVendorDto.telephone }] : []),
        ],
      });

      if (existingVendor) {
        throw new ConflictException('Vendor with this email or phone already exists');
      }
    }

    const vendor = await this.vendorModel
      .findByIdAndUpdate(id, { $set: updateVendorDto }, { new: true, runValidators: true })
      .populate('user_id firm_id')
      .exec();

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async deleteVendor(id: string): Promise<void> {
    const vendor = await this.vendorModel.findById(id);

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    await this.vendorModel.findByIdAndDelete(id);
  }

  async updateVendorStatus(id: string, status: string): Promise<Vendor> {
    const vendor = await this.vendorModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async exportVendors(firmId: string) {
    const vendors = await this.vendorModel
      .find({ firm_id: firmId })
      .populate('user_id', 'name')
      .populate('firm_id', 'name address')
      .sort({ createdAt: -1 })
      .exec();

    return vendors.map((vendor, index) => ({
      'S.No': index + 1,
      'Full Name': vendor.fullName,
      'Email': vendor.email,
      'Address': vendor.address.fullAddress,
      'Country': vendor.address.country,
      'State': vendor.address.state,
      'City': vendor.address.city,
      'Additional Number': vendor.telephone,
      'Additional Sub Number': vendor.additionalTelephone || '',
      'Bank Name': vendor.bankDetails.bankName,
      'Account Name': vendor.bankDetails.accountName,
      'Account Number': vendor.bankDetails.accountNumber,
      'IFSC Code': vendor.bankDetails.ifscCode,
      'Type': vendor.type,
      'Status': vendor.status,
    }));
  }
}