import { PartialType } from '@nestjs/mapped-types';
import { CreateBusinessQueryDto } from './create-business-query.dto';

export class UpdateBusinessQueryDto extends PartialType(CreateBusinessQueryDto) {}