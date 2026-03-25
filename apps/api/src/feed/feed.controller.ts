import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApprovedAccountGuard } from '../common/guards/approved-account.guard';
import { CreateCommentDto, CreatePostDto, CreateReactionDto, FeedQueryDto, PaginationQueryDto } from './dto';
import { FeedService } from './feed.service';

@UseGuards(JwtAuthGuard, ApprovedAccountGuard)
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('posts')
  listPosts(@Query() query: FeedQueryDto) {
    return this.feedService.listPosts(query);
  }

  @Post('posts')
  createPost(@CurrentUser() user: { sub: string }, @Body() dto: CreatePostDto) {
    return this.feedService.createPost(user.sub, dto);
  }

  @Get('posts/:postId/comments')
  listComments(@Param('postId') postId: string, @Query() query: PaginationQueryDto) {
    return this.feedService.listComments(postId, Number(query.page ?? 1), Number(query.limit ?? 10));
  }

  @Post('posts/:postId/comments')
  createComment(
    @CurrentUser() user: { sub: string },
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.feedService.createComment(user.sub, postId, dto);
  }

  @Post('posts/:postId/reactions')
  react(
    @CurrentUser() user: { sub: string },
    @Param('postId') postId: string,
    @Body() dto: CreateReactionDto,
  ) {
    return this.feedService.react(user.sub, postId, dto.type);
  }
}
