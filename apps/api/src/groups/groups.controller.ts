import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApprovedAccountGuard } from '../common/guards/approved-account.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateGroupDto, GroupsQueryDto } from './dto';
import { GroupsService } from './groups.service';

@UseGuards(JwtAuthGuard, ApprovedAccountGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  list(@Query() query: GroupsQueryDto) {
    return this.groupsService.list(query);
  }

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateGroupDto) {
    return this.groupsService.create(user.sub, dto);
  }

  @Post(':groupId/memberships')
  join(@CurrentUser() user: { sub: string }, @Param('groupId') groupId: string) {
    return this.groupsService.join(user.sub, groupId);
  }
}
