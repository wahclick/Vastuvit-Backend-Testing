// dto/login.dto.ts
import { IsNotEmpty, IsString } from '@nestjs/class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  emp_id: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}