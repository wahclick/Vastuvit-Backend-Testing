// crew.controller.ts
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
} from '@nestjs/common';
import { CrewService } from './crew.service';
import { RanksService } from '../ranks/ranks.service'; // Import RanksService
import { CreateCrewDto } from './dto/create-crew.dto';
import { UpdateCrewDto } from './dto/update-crew.dto';
import { LoginDto } from './dto/login.dto';
import { Types } from 'mongoose';

@Controller('crew')
export class CrewController {
  constructor(
    private readonly crewService: CrewService,
    private readonly ranksService: RanksService, // Inject RanksService
  ) {}

  @Post('create')
  create(@Body() createCrewDto: CreateCrewDto) {
    return this.crewService.create(createCrewDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Use LoginDto
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
}
