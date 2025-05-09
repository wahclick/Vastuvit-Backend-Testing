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

    // If the user is not valid, throw an exception

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return a proper response object
    return {
      statusCode: 200,
      message: 'Login successful',
      user: {
        id: user._id,
        mobile: user.mobile,
        name: user.name,
      },
    };
  }
}
