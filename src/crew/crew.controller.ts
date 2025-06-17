import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UnauthorizedException,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { CrewService } from './crew.service';
import { RanksService } from '../ranks/ranks.service';
import { CreateCrewDto } from './dto/create-crew.dto';
import { UpdateCrewDto } from './dto/update-crew.dto';
import { LoginDto } from './dto/login.dto';
import { Types } from 'mongoose';
import { UpdateLeaveBalancesDto } from './dto/update-leave-balances.dto';

@Controller('crew')
export class CrewController {
  constructor(
    private readonly crewService: CrewService,
    private readonly ranksService: RanksService,
  ) {}

  @Post('create')
  create(@Body() createCrewDto: CreateCrewDto) {
    return this.crewService.create(createCrewDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.crewService.validateByEmpId(
        loginDto.emp_id,
        loginDto.password,
      );
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      // Determine role based on rankId
      let role = 'user';
      if (user.rankId) {
        const rank = await this.ranksService.findOne(user.rankId.toString());
        if (rank) {
          if (rank.category === 'SR Management') {
            role = 'admin';
          } else if (
            rank.category === 'Management' ||
            rank.category === 'Sr Design Crew'
          ) {
            role = 'manager';
          }
        }
      }
      return {
        success: true,
        user: {
          ...user,
          role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Get()
  findAll(@Query('firmId') firmId: string) {
    return this.crewService.findAll(new Types.ObjectId(firmId));
  }

  @Get('by-name')
  async findByName(
    @Query('name') name: string,
    @Query('firmId') firmId: string,
  ) {
    if (!name || !firmId) {
      throw new NotFoundException('Name and firmId parameters are required');
    }

    try {
      const user = await this.crewService.findByName(
        name,
        new Types.ObjectId(firmId),
      );

      if (!user) {
        throw new NotFoundException(`User with name ${name} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new UnauthorizedException(`Error finding user: ${error.message}`);
    }
  }

  @Get('rank/:rankId')
  findByRank(@Query('firmId') firmId: string, @Param('rankId') rankId: string) {
    return this.crewService.findByFirmAndRank(
      new Types.ObjectId(firmId),
      new Types.ObjectId(rankId),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.crewService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCrewDto: UpdateCrewDto) {
    return this.crewService.update(id, updateCrewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.crewService.remove(id);
  }

  @Put(':id/leave-balances')
  async updateLeaveBalances(
    @Param('id') id: string,
    @Body() updateLeaveBalancesDto: UpdateLeaveBalancesDto,
  ) {
    return this.crewService.updateLeaveBalances(id, updateLeaveBalancesDto);
  }

  @Get(':id/leave-balances')
  async getLeaveBalances(@Param('id') id: string) {
    return this.crewService.getLeaveBalances(id);
  }
}
