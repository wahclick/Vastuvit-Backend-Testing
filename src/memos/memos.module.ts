// src/memos/memos.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemosController } from './memos.controller';
import { MemosService } from './memos.service';
import { Memo, MemoSchema } from './schemas/memo.schema/memo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Memo.name, schema: MemoSchema }]),
  ],
  controllers: [MemosController],
  providers: [MemosService],
  exports: [MemosService],
})
export class MemosModule {}
