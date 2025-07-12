// transmittal.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransmittalService } from './transmittal.service';
import { TransmittalController } from './transmittal.controller';
import { Transmittal, TransmittalSchema } from './schemas/transmittal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transmittal.name, schema: TransmittalSchema }
    ]),
  ],
  controllers: [TransmittalController],
  providers: [TransmittalService],
  exports: [TransmittalService], // Export service if needed in other modules
})
export class TransmittalModule {}