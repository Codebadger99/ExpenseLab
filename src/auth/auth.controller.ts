import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Register } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  Register(@Body() register: Register){
    return this.authService.Register(register)
  }
}
