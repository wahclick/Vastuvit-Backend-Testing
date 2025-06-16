import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReferralService } from './referral.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';


@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createReferral(@Body() createReferralDto: CreateReferralDto) {
    return this.referralService.createReferral(createReferralDto);
  }

  @Get('firm/:firmId')
  async findReferralsByFirm(@Param('firmId') firmId: string) {
    return this.referralService.findReferralsByFirm(firmId);
  }

  @Get('stats/:firmId')
  async getReferralStats(@Param('firmId') firmId: string) {
    return this.referralService.getReferralStats(firmId);
  }

  @Get('export/:firmId')
  async exportReferrals(@Param('firmId') firmId: string) {
    return this.referralService.exportReferrals(firmId);
  }

  @Get(':id')
  async findReferralById(@Param('id') id: string) {
    return this.referralService.findReferralById(id);
  }

  @Patch(':id')
  async updateReferral(
    @Param('id') id: string,
    @Body() updateReferralDto: UpdateReferralDto,
  ) {
    return this.referralService.updateReferral(id, updateReferralDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReferral(@Param('id') id: string) {
    return this.referralService.deleteReferral(id);
  }

  @Get('project/:projectId')
  async findReferralsByProject(@Param('projectId') projectId: string) {
    return this.referralService.findReferralsByProject(projectId);
  }

  @Patch(':id/status')
  async updateReferralStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.referralService.updateReferralStatus(id, status);
  }

  @Post(':id/add-project')
  async addProjectToReferral(
    @Param('id') id: string,
    @Body('projectId') projectId: string,
  ) {
    return this.referralService.addProjectToReferral(id, projectId);
  }

  @Post(':id/calculate-amount')
  async calculateReferralAmount(
    @Param('id') id: string,
    @Body('projectValue') projectValue: number,
  ) {
    return this.referralService.calculateReferralAmount(id, projectValue);
  }
}
