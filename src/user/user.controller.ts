import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsBoolean } from 'class-validator';
import { UserService } from './user.service';

class UpdateOnboardingDto {
  @IsBoolean()
  onboardingCompleted: boolean;
}

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@Req() req: { user: { id: number } }) {
    return this.userService.getMe(req.user.id);
  }

  @Patch('me/onboarding')
  updateOnboarding(
    @Req() req: { user: { id: number } },
    @Body() body: UpdateOnboardingDto,
  ) {
    return this.userService.updateOnboarding(req.user.id, body.onboardingCompleted);
  }
}
