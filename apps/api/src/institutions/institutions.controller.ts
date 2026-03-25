import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateInstitutionRequestDto } from './dto';
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
  createRequest(@Body() dto: CreateInstitutionRequestDto) {
    return this.institutionsService.createRequest(dto);
  }
}
