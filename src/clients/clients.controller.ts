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

  @Post('create')
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Get()
  findAll(@Query('firmId') firmId: string) {
    return this.clientService.findAll(new Types.ObjectId(firmId));
  }

  @Get('manager/:userId')
  findByManager(@Param('userId') userId: string) {
    return this.clientService.findByManager(new Types.ObjectId(userId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(id, updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }

  @Patch(':id/toggle')
  toggleEnabled(@Param('id') id: string) {
    return this.clientService.toggleEnabled(id);
  }

  @Patch(':clientId/projects/:projectId/add')
  addProject(
    @Param('clientId') clientId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.clientService.addProjectToClient(
      clientId,
      new Types.ObjectId(projectId),
    );
  }

  @Patch(':clientId/projects/:projectId/remove')
  removeProject(
    @Param('clientId') clientId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.clientService.removeProjectFromClient(
      clientId,
      new Types.ObjectId(projectId),
    );
  }
}
