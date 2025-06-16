import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { Vendor, VendorSchema } from './schema/vendor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vendor.name, schema: VendorSchema }
    ])
  ],
  controllers: [VendorController],
  providers: [VendorService],
  exports: [VendorService]
})
export class VendorModule {}