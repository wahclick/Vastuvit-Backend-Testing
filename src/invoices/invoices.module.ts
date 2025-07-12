import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceSchema } from './schemas/invoice.schema';
import { ClientSchema } from 'src/clients/schemas/clients.schema';
import { ProjectSchema } from 'src/projects/schemas/projects.schema';
import { FirmsSchema } from 'src/firms/schemas/firms.schema';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Invoice', schema: InvoiceSchema },
      { name: 'Client', schema: ClientSchema }, // Import your existing client schema
      { name: 'Project', schema: ProjectSchema }, // Import your existing project schema
      { name: 'Firms', schema: FirmsSchema }, // Import your existing firms schema
    ]),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}