import { Controller, Get, Param, ParseIntPipe, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from './notification.service';

type Req_ = { user: { id: number } };

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationController {
  constructor(private notifications: NotificationService) {}

  @Get()
  findAll(@Req() req: Req_, @Query('unread') unread?: string, @Query('unreadOnly') unreadOnly?: string) {
    const shouldFilter = unread === 'true' || unreadOnly === 'true';
    return this.notifications.findAll(req.user.id, shouldFilter);
  }

  @Get('unread-count')
  unreadCount(@Req() req: Req_) {
    return this.notifications.unreadCount(req.user.id);
  }

  @Patch('read-all')
  markAllRead(@Req() req: Req_) {
    return this.notifications.markAllRead(req.user.id);
  }

  @Patch(':id/read')
  markRead(@Req() req: Req_, @Param('id', ParseIntPipe) id: number) {
    return this.notifications.markRead(req.user.id, id);
  }
}