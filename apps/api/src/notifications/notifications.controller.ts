import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApprovedAccountGuard } from '../common/guards/approved-account.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard, ApprovedAccountGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: { sub: string }, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.notificationsService.list(user.sub, Number(page ?? 1), Number(limit ?? 20));
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.notificationsService.markRead(user.sub, id);
  }
}
