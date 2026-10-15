import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { UserService } from './user.service';

class UpdateOnboardingDto {
  @IsBoolean()
  onboardingCompleted: boolean;
}

class UpdateMonthlyTrackAmountDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  monthlyTrackAmount?: number;
}

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@Req() req: { user: { id: number } }) {
    return this.userService.getMe(req.user.id);
  }

  @Patch('me/monthly-track-amount')
  updateMonthlyTrackAmount(
    @Req() req: { user: { id: number } },
    @Body() dto: UpdateMonthlyTrackAmountDto,
  ) {
    return this.userService.updateMonthlyTrackAmount(req.user.id, dto.monthlyTrackAmount ?? null);
  }
}
