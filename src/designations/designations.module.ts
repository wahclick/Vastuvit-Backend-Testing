import { Module } from '@nestjs/common';
import { DesignationsService } from './designations.service';
import { DesignationsController } from './designations.controller';
import { Designation, DesignationSchema } from './schema/designations.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
   imports: [
      MongooseModule.forFeature([{ name: Designation.name, schema: DesignationSchema }]),
    ],
  providers: [DesignationsService],
  controllers: [DesignationsController],
  exports: [DesignationsService]
})
export class DesignationsModule {}
