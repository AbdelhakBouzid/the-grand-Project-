import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ReviewVerificationDto } from './dto';
import { ReviewerService } from './reviewer.service';

@Controller('reviewer/verifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.reviewer, UserRole.super_admin)
export class ReviewerController {
  constructor(private readonly reviewerService: ReviewerService) {}

  @Get()
  listPending() {
    return this.reviewerService.listPending();
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.reviewerService.detail(id);
  }

  @Patch(':id')
  review(@Param('id') id: string, @CurrentUser() user: { sub: string }, @Body() dto: ReviewVerificationDto) {
    return this.reviewerService.review(id, user.sub, dto);
  }
}
