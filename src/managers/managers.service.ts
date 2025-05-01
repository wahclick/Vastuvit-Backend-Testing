import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; // Import InjectModel
import { Model } from 'mongoose';
import { Manager, ManagerDocument } from './schemas/manager.schema'; // Import Schema type and Class
import { FirmsService } from 'src/firms/firms.service';
import { CreateManagerDto } from './dto/create-manager.dto';



@Injectable()
export class ManagersService {
  constructor(
    // Inject the Manager model using @InjectModel
    @InjectModel(Manager.name) private managerModel: Model<ManagerDocument>,
    private readonly firmService:FirmsService
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

  // Add other methods like findOne, findAll, etc. here
}