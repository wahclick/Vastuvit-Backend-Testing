import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.mobile,
      loginDto.password,
    );

    // Step 2: If the user is valid, generate a JWT token
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return 200; // Return the JWT token
  }
}
