import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Register } from './dto/register.dto';
import { Login } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  Register(@Body() register: Register){
    return this.authService.Register(register)
  }

  @Post('login')
  Login(@Body() login: Login){
    return this.authService.Login(login)
  }
}
