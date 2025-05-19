// src/leave/leave.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveService } from './leaves.service';
import { LeaveController } from './leaves.controller';
import { Leave, LeaveSchema } from './schema/leave.schema';
import { CrewModule } from 'src/crew/crew.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Leave.name, schema: LeaveSchema }]),
    CrewModule,
  ],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
