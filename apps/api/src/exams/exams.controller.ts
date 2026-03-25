import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { ApprovedAccountGuard } from '../common/guards/approved-account.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { CreateExamDto, ExamQueryDto } from './dto';
import { ExamsService } from './exams.service';

@UseGuards(JwtAuthGuard, ApprovedAccountGuard)
@Controller('exam-archive')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  list(@Query() query: ExamQueryDto) {
    return this.examsService.list(query);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.teacher, UserRole.institution_admin, UserRole.super_admin)
  @Post()
  create(@Body() dto: CreateExamDto) {
    return this.examsService.create(dto);
  }
}
