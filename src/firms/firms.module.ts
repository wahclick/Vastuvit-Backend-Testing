import { Module } from '@nestjs/common';
import { FirmsService } from './firms.service';
import { FirmsController } from './firms.controller';

@Module({
  providers: [FirmsService],
  controllers: [FirmsController]
})
export class FirmsModule {}
