import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessQueryService } from './business-query.service';
import { BusinessQueryController } from './business-query.controller';
import { BusinessQuerySchema, BusinessQuery } from './schema/business-query.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BusinessQuery.name, schema: BusinessQuerySchema },
    ]),
  ],
  controllers: [BusinessQueryController],
  providers: [BusinessQueryService],
  exports: [BusinessQueryService],
})
export class BusinessQueryModule {}