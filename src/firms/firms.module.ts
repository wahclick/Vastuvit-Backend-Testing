import { Module } from '@nestjs/common';
import { FirmsService } from './firms.service';
import { FirmsController } from './firms.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Firms , FirmsSchema } from './schemas/firms.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name:Firms.name,schema:FirmsSchema}])
  ],
  providers: [FirmsService],
  controllers: [FirmsController],
  exports: [FirmsService]
})
export class FirmsModule {}
