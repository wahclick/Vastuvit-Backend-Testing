import { Body, Controller, Post } from '@nestjs/common';
import { ManagersService } from './managers.service';


interface CreateManagerDto{
    email:string,
    mobile:string
}

@Controller('managers')
export class ManagersController {
    constructor(private readonly managersService: ManagersService){}

    @Post('signup')
    async signup(@Body() createManagerDto: CreateManagerDto): Promise<{message: string}>{
        await this.managersService.create(createManagerDto);
        return {message: 'Manager registered sucessfully'}
    }
}
