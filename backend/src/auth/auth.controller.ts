import { Controller, Post, Body, Delete, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Register } from './dto/register.dto';
import { Login } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { DeleteAccountDto } from './dto/delete-password.dto';
import { Throttle } from '@nestjs/throttler';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CheckEmailDto } from './dto/check-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  Register(@Body() register: Register) {
    return this.authService.Register(register)
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  Login(@Body() login: Login) {
    return this.authService.Login(login)
  }

  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  checkMail(@Body() dto: CheckEmailDto) {
    return this.authService.checkMail(dto.email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 600_000 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }


  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Delete('account')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  deleteAccount(
    @Req() req: { user: { id: number } },
    @Body() dto: DeleteAccountDto,
  ) {
    return this.authService.deleteAccount(
      req.user.id,
      dto.password,
    );
  }

}
