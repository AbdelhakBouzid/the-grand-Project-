import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateInstitutionRequestDto, ReviewInstitutionRequestDto } from './dto';
import { InstitutionsService } from './institutions.service';

@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  list() {
    return this.institutionsService.list();
  }

  @UseGuards(JwtAuthGuard)
  @Post('requests')
  createRequest(@CurrentUser() user: { sub: string }, @Body() dto: CreateInstitutionRequestDto) {
    return this.institutionsService.createRequest(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.super_admin)
  @Get('requests/pending')
  listPendingRequests() {
    return this.institutionsService.listPendingRequests();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.super_admin)
  @Patch('requests/:id/review')
  reviewRequest(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: ReviewInstitutionRequestDto,
  ) {
    return this.institutionsService.reviewRequest(id, user.sub, dto.action, dto.reason);
  }
}
