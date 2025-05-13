import { Injectable } from '@nestjs/common';
import { ManagersService } from 'src/managers/managers.service';
import * as bcrypt from 'bcrypt'; // or bcryptjs

@Injectable()
export class AuthService {
  constructor(private readonly managerService: ManagersService) {}

  async validateUser(mobile: string, password: string): Promise<any> {
    const manager = await this.managerService.findByMobile(mobile);

    if (!manager) return null;

    const isPasswordValid = await bcrypt.compare(password, manager.password);


    if (isPasswordValid) {
      return manager;
    }

    return null; // Return null for both "user not found" and "invalid password" cases
  }
}
