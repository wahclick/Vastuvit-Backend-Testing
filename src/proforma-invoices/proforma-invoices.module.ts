import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProformaInvoicesService } from './proforma-invoices.service';
import { ProformaInvoicesController } from './proforma-invoices.controller';
import { ProformaInvoiceSchema } from './schemas/proforma-invoice.schema';
import { ClientSchema } from 'src/clients/schemas/clients.schema';
import { ProjectSchema } from 'src/projects/schemas/projects.schema';
import { FirmsSchema } from 'src/firms/schemas/firms.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ProformaInvoice', schema: ProformaInvoiceSchema },
      { name: 'Client', schema: ClientSchema }, // Import your existing client schema
      { name: 'Project', schema: ProjectSchema }, // Import your existing project schema
      { name: 'Firms', schema: FirmsSchema }, // Import your existing firms schema
    ]),
  ],
  controllers: [ProformaInvoicesController],
  providers: [ProformaInvoicesService],
  exports: [ProformaInvoicesService],
})
export class ProformaInvoicesModule {}