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
    const userData = JSON.parse(JSON.stringify(user));

    return {
      statusCode: 200,
      message: 'Login successful',
      user: {
        id: userData._doc._id, // Include both formats to be safe
        name: userData._doc.name,
        mobile: userData._doc.mobile,
        email: userData._doc.email,
        role: userData._doc.role,
        // Add other fields you need, but avoid sending password
      },
    };
  }
}
