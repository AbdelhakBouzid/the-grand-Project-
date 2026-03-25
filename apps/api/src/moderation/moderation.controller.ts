import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ApprovedAccountGuard } from '../common/guards/approved-account.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateReportDto } from './dto';
import { ModerationService } from './moderation.service';

@UseGuards(JwtAuthGuard, ApprovedAccountGuard)
@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('reports')
  createReport(@CurrentUser() user: { sub: string }, @Body() dto: CreateReportDto) {
    return this.moderationService.createReport(user.sub, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.moderator, UserRole.reviewer, UserRole.super_admin)
  @Get('reports')
  listReports(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.moderationService.listReports(Number(page ?? 1), Number(limit ?? 20));
  }
}
