import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ManagersService } from 'src/managers/managers.service';
import * as bcrypt from 'bcrypt'; // or bcryptjs

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly managerService: ManagersService) {}

  async validateUser(mobile: string, password: string): Promise<any> {
    try {
      // Attempt to find the manager by mobile number
      const manager = await this.managerService.findByMobile(mobile);

      // If no manager is found, return null
      if (!manager) return null;

      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, manager.password);

      // If password is valid, return the manager object
      if (isPasswordValid) {
        // Remove sensitive data before returning
        const { password, ...result } = manager;
        return result;
      }

      // Password is invalid, return null
      return null;
    } catch (error) {
      // Log the error for debugging
      this.logger.error(`Error validating user: ${error.message}`, error.stack);

      return null;
    }
  }
}
