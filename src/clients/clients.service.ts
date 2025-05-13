import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Client, ClientDocument } from './schemas/clients.schema';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel('Client') private clientModel: Model<ClientDocument>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    try {
      const createdClient = new this.clientModel(createClientDto);
      return await createdClient.save();
    } catch (error) {
      console.error('Error creating client:', error);
      throw new InternalServerErrorException(
        'Failed to create client: ' + error.message,
      );
    }
  }

  async findAll(firmId: Types.ObjectId | string): Promise<Client[]> {
    try {
      return this.clientModel
        .find({ firmId })
        .populate('userId')
        .populate('projectIds')
        .exec();
    } catch (error) {
      console.error('Error finding clients:', error);
      throw new InternalServerErrorException(
        'Failed to find clients: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<Client> {
    try {
      const client = await this.clientModel
        .findById(id)
        .populate('userId')
        .populate('projectIds')
        .populate('firmId')
        .exec();

      if (!client) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }

      return client;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error finding client:', error);
      throw new InternalServerErrorException(
        'Failed to find client: ' + error.message,
      );
    }
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    try {
      const updatedClient = await this.clientModel
        .findByIdAndUpdate(id, updateClientDto, { new: true })
        .exec();

      if (!updatedClient) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }

      return updatedClient;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating client:', error);
      throw new InternalServerErrorException(
        'Failed to update client: ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.clientModel.findByIdAndDelete(id).exec();

      if (!result) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error removing client:', error);
      throw new InternalServerErrorException(
        'Failed to remove client: ' + error.message,
      );
    }
  }

  async findByManager(userId: Types.ObjectId | string): Promise<Client[]> {
    try {
      return this.clientModel.find({ userId }).populate('projectIds').exec();
    } catch (error) {
      console.error('Error finding clients by manager:', error);
      throw new InternalServerErrorException(
        'Failed to find clients by manager: ' + error.message,
      );
    }
  }

  async toggleEnabled(id: string): Promise<Client> {
    try {
      const client = await this.clientModel.findById(id);

      if (!client) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }

      client.isEnabled = !client.isEnabled;
      return client.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error toggling client status:', error);
      throw new InternalServerErrorException(
        'Failed to toggle client status: ' + error.message,
      );
    }
  }

  async addProjectToClient(
    clientId: string,
    projectId: Types.ObjectId | string,
  ): Promise<Client> {
    try {
      const client = await this.clientModel.findById(clientId);

      if (!client) {
        throw new NotFoundException(`Client with ID ${clientId} not found`);
      }

      if (!client.projectIds) {
        client.projectIds = [];
      }

      // Check if project is already associated with client
      if (!client.projectIds.some((id) => id.equals(projectId))) {
        client.projectIds.push(new Types.ObjectId(projectId));
      }

      return client.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error adding project to client:', error);
      throw new InternalServerErrorException(
        'Failed to add project to client: ' + error.message,
      );
    }
  }

  async removeProjectFromClient(
    clientId: string,
    projectId: Types.ObjectId | string,
  ): Promise<Client> {
    try {
      const client = await this.clientModel.findById(clientId);

      if (!client) {
        throw new NotFoundException(`Client with ID ${clientId} not found`);
      }

      if (client.projectIds && client.projectIds.length > 0) {
        client.projectIds = client.projectIds.filter(
          (id) => !id.equals(projectId),
        );
      }

      return client.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error removing project from client:', error);
      throw new InternalServerErrorException(
        'Failed to remove project from client: ' + error.message,
      );
    }
  }
}
