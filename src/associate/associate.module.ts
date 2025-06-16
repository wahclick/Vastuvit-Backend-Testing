import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssociateService } from './associate.service';
import { AssociateController } from './associate.controller';
import { Associate, AssociateSchema } from './schema/associate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Associate.name, schema: AssociateSchema },
    ]),
  ],
  controllers: [AssociateController],
  providers: [AssociateService],
  exports: [AssociateService],
})
export class AssociateModule {}
