import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApprovedAccountGuard } from '../common/guards/approved-account.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateResourceDto, ResourceQueryDto } from './dto';
import { ResourcesService } from './resources.service';

@UseGuards(JwtAuthGuard, ApprovedAccountGuard)
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  list(@Query() query: ResourceQueryDto) {
    return this.resourcesService.list(query);
  }

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateResourceDto) {
    return this.resourcesService.create(user.sub, dto);
  }
}
