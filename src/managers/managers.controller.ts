import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ManagersService } from './managers.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';

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

  @Get(':id/firms')
  async getManagerFirms(@Param('id') id: string) {
    const manager = await this.managersService.getFirmsByManagerId(id);
    return {
      managerId: manager._id,
      name: manager.name,
      firms: manager.ownedFirms,
    };
  }
}
