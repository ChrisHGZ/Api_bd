import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dtos/register.dto';

@Controller('user')
export class UserController {
    constructor(
        private readonly _userService: UserService
    ) {}

    @Post()
    register(@Body() registerDto: RegisterDto) {
        return this._userService.register(registerDto)
    }
}
