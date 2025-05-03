import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; // Import InjectModel
import { Model, Types } from 'mongoose';
import { Manager, ManagerDocument } from './schemas/manager.schema'; // Import Schema type and Class
import { FirmsService } from 'src/firms/firms.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { FirmsDocument } from 'src/firms/schemas/firms.schema';



@Injectable()
export class ManagersService {
  constructor(
    // Inject the Manager model using @InjectModel
    @InjectModel(Manager.name) private managerModel: Model<ManagerDocument>,
    private readonly firmsService:FirmsService
  ) {}

  async create(createManagerDto: CreateManagerDto): Promise<ManagerDocument> {
    const { email, mobile } = createManagerDto;

    // Basic validation (schema validation also applies on save)
    if (!email || !mobile) {
         // This should ideally be handled by validation pipes or DTO class-validator
         // For simplicity here, we'll rely on Mongoose schema validation primarily.
         // But let's add an explicit check for uniqueness before attempting save.
    }

    try {
        // Check if a manager with the same email or mobile number already exists
        const existingManager = await this.managerModel.findOne({
            $or: [{ email: email }, { mobile: mobile }],
        });

        if (existingManager) {
            let message = 'A user with this ';
            if (existingManager.email === email && existingManager.mobile === mobile) {
                message += 'email and mobile number';
            } else if (existingManager.email === email) {
                message += 'email address';
            } else {
                message += 'mobile number';
            }
            message += ' already exists.';
            throw new ConflictException(message); // Throw a NestJS ConflictException
        }

        // Create a new manager instance and save it
        const createdManager = new this.managerModel(createManagerDto);
        return createdManager.save();

    } catch (error) {
        console.error('Signup service error:', error);
         // Handle Mongoose validation errors or other potential errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val: any) => val.message);
            throw new InternalServerErrorException(`Validation failed: ${messages.join(', ')}`);
        }
        // If it's already a ConflictException, re-throw it
        if (error instanceof ConflictException) {
            throw error;
        }
        // For any other error, throw a generic InternalServerErrorException
        throw new InternalServerErrorException('Failed to register manager.');
    }
  }

  async completeProfile(completeProfileDto:CompleteProfileDto): Promise<string>{

const {mobile, firmDetails} = completeProfileDto;
try {
const manager = await this.managerModel.findOne({mobile});

if (!manager){
    throw new NotFoundException(`Manager with mobile ${mobile} not found`)
}

await this.managerModel.updateOne (
    {_id:manager._id},
    {
        $set:{
            name:completeProfileDto.name,
            password:completeProfileDto.password,
            address:completeProfileDto.address,
            profileImage:completeProfileDto.profileImage,
            profileCompleted: true,
            updatedAt: new Date()
        }
    }
);

const firm = await this.firmsService.create({
    name: firmDetails.firmName,
    address: firmDetails.address,  
    logo: firmDetails.logo,
    user_id: manager._id as Types.ObjectId,
  }) as FirmsDocument;

await this.managerModel.updateOne(
    { _id: manager._id },
    { 
      $push: { ownedFirms: firm._id },
    }
  );
  
  return firm._id.toString();
} catch (error) {
  console.error('Complete profile error:', error);
  if (error instanceof NotFoundException) {
    throw error;
  }
  throw new InternalServerErrorException('Failed to complete manager profile: ' + error.message);
}


}


async findByMobile(mobile: string): Promise<ManagerDocument | null> {
    return this.managerModel.findOne({ mobile }).exec();
  }
  
  async findById(id: string): Promise<ManagerDocument | null> {
    return this.managerModel.findById(id).exec();
  }
  
  async getFirmsByManagerId(managerId: string): Promise<any> {
    // Populate the ownedFirms to get firm details
    return this.managerModel
      .findById(managerId)
      .populate('ownedFirms')
      .exec();
  }
}
  // Add other methods like findOne, findAll, etc. here
