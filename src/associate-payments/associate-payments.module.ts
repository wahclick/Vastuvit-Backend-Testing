// src/associate-payments/associate-payments.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssociatePaymentsService } from './associate-payments.service';
import { AssociatePaymentsController } from './associate-payments.controller';

// Import your schemas
import { AssociatePayment, AssociatePaymentSchema } from './schemas/associate-payment.schema';
import { Associate, AssociateSchema } from 'src/associate/schema/associate.schema';
import { Project, ProjectSchema } from 'src/projects/schemas/projects.schema';

// Import the modules

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssociatePayment.name, schema: AssociatePaymentSchema },
      { name: Associate.name, schema: AssociateSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    // Optionally import the whole modules if you need their services
    // AssociatesModule,
    // ProjectsModule,
  ],
  controllers: [AssociatePaymentsController],
  providers: [AssociatePaymentsService],
  exports: [AssociatePaymentsService],
})
export class AssociatePaymentsModule {}