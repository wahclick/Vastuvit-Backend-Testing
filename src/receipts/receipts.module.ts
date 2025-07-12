import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReceiptSchema } from './schemas/receipt.schema';
import { ClientSchema } from 'src/clients/schemas/clients.schema';
import { ProjectSchema } from 'src/projects/schemas/projects.schema';
import { FirmsSchema } from 'src/firms/schemas/firms.schema';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Receipt', schema: ReceiptSchema },
      { name: 'Client', schema: ClientSchema }, // Import your existing client schema
      { name: 'Project', schema: ProjectSchema }, // Import your existing project schema
      { name: 'Firms', schema: FirmsSchema }, // Import your existing firms schema
    ]),
  ],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}