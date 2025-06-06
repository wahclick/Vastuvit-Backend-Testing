import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ManagersService } from './managers.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';

@Controller('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Post('signup')
  async signup(
    @Body() createManagerDto: CreateManagerDto,
  ): Promise<{ message: string }> {
    await this.managersService.create(createManagerDto);
    return { message: 'Manager registered successfully' };
  }

  @Put('complete-profile')
  async completeProfile(
    @Body() completeProfileDto: CompleteProfileDto,
  ): Promise<{ message: string; firmId: string }> {
    const firmId =
      await this.managersService.completeProfile(completeProfileDto);
    return {
      message: 'Profile completed successfully',
      firmId: firmId,
    };
  }
  // Update your ManagersController PATCH method

  @Patch(':id')
  async updateManager(
    @Param('id') id: string,
    @Body() updateManagerDto: UpdateManagerDto,
  ) {
    const updatedManager = await this.managersService.updateManager(
      id,
      updateManagerDto,
    );
    return updatedManager; // This will now handle the proper return type
  }

  @Get(':id/firms')
  async getManagerFirms(@Param('id') id: string) {
    const manager = await this.managersService.getFirmsByManagerId(id);
    return {
      managerId: manager._id,
      name: manager.name,
      firms: manager.ownedFirms,
    };
  }

  @Get('')
  async getManagersByFirmId(@Query('firmId') firmId: string) {
    return this.managersService.findAllByFirmId(firmId);
  }
}
