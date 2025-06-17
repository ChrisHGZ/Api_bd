import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entity/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this._authService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this._authService.login(loginUserDto);
  }

  @Get('check-auth-status')
  checkAuthStatus(@GetUser() user: User) {
    return this._authService.checkAuthStatus(user);
  }
}
