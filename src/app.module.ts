import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ManagersModule } from './managers/managers.module';
import { FirmsModule } from './firms/firms.module';
import { AuthModule } from './auth/auth.module';
import { RanksModule } from './ranks/ranks.module';
import { DesignationsModule } from './designations/designations.module';
import { CrewModule } from './crew/crew.module';
import { ClientsModule } from './clients/clients.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { MemosModule } from './memos/memos.module';
import { LeaveModule } from './leaves/leaves.module';
import { AttendanceModule } from './attendance/attendance.module';
import { TeamModule } from './team/team.module';
import { AccountingModule } from './accounting/accounting.module';
import { ReferralModule } from './referral/referral.module';
import { AssociateModule } from './associate/associate.module';
import { VendorModule } from './vendor/vendor.module';
import { PrintModule } from './print/print.module';
import { ReferralPaymentsModule } from './referral-payments/referral-payments.module';
import { AssociatePaymentsModule } from './associate-payments/associate-payments.module';
import { TeamReportsModule } from './team-reports/team-reports.module';
import { TransmittalModule } from './transmittal/transmittal.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { ProformaInvoicesModule } from './proforma-invoices/proforma-invoices.module';
import { BusinessQueryModule } from './business-query/business-query.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    ManagersModule,
    FirmsModule,
    AuthModule,
    RanksModule,
    DesignationsModule,
    CrewModule,
    ClientsModule,
    ProjectsModule,
    TasksModule,
    MemosModule,
    LeaveModule,
    AttendanceModule,
    TeamModule,
    AccountingModule,
    ReferralModule,
    AssociateModule,
    VendorModule,
    PrintModule,
    ReferralPaymentsModule,
    AssociatePaymentsModule,
    TeamReportsModule,
    TransmittalModule,
    InvoicesModule,
    ReceiptsModule,
    VouchersModule,
    ProformaInvoicesModule,
    BusinessQueryModule, // This already contains PrintService and PrintController
  ],
  controllers: [AppController], // Remove PrintController from here
  providers: [AppService], // Remove PrintService from here
})
export class AppModule {}