import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Types } from 'mongoose';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientService: ClientsService) {}

  // Route: POST /clients/createClient
  @Post('createClient')
  createClient(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  // Route: GET /clients/getAllClients?firmId=...
  @Get('getAllClients')
  getAllClients(@Query('firmId') firmId: string) {
    return this.clientService.findAll(new Types.ObjectId(firmId));
  }

  // Route: GET /clients/getClientsByManager/:userId
  @Get('getClientsByManager/:userId')
  getClientsByManager(@Param('userId') userId: string) {
    return this.clientService.findByManager(new Types.ObjectId(userId));
  }

  // Route: GET /clients/getClientById/:id
  @Get('getClientById/:id')
  getClientById(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  // Route: PATCH /clients/updateClient/:id
  @Patch('updateClient/:id')
  updateClient(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(id, updateClientDto);
  }

  // Route: DELETE /clients/deleteClient/:id
  @Delete('deleteClient/:id')
  deleteClient(@Param('id') id: string) {
    return this.clientService.remove(id);
  }

  // Route: PATCH /clients/toggleClientStatus/:id
  @Patch('toggleClientStatus/:id')
  toggleClientStatus(@Param('id') id: string) {
    return this.clientService.toggleEnabled(id);
  }


  @Patch('updateGstin/:id')
  async updateClientGstin(
    @Param('id') id: string,
    @Body('gstin') gstin: string
  ) {
    // Validate GSTIN format if provided
    if (gstin && gstin.trim() !== '') {

        
      
    

    const updateData: UpdateClientDto = { gstin: gstin || '' };
    return this.clientService.update(id, updateData);}
  }

  // Route: PATCH /clients/addProjectToClient/:clientId/project/:projectId
  @Patch('addProjectToClient/:clientId/project/:projectId')
  addProjectToClient(
    @Param('clientId') clientId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.clientService.addProjectToClient(
      clientId,
      new Types.ObjectId(projectId),
    );
  }

  // Route: PATCH /clients/removeProjectFromClient/:clientId/project/:projectId
  @Patch('removeProjectFromClient/:clientId/project/:projectId')
  removeProjectFromClient(
    @Param('clientId') clientId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.clientService.removeProjectFromClient(
      clientId,
      new Types.ObjectId(projectId),
    );
  }
}