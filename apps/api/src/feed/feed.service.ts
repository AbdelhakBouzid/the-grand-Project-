import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, CreatePostDto, FeedQueryDto } from './dto';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async listPosts(query: FeedQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const where = query.q
      ? {
          OR: [
            { body: { contains: query.q, mode: 'insensitive' as const } },
            { user: { email: { contains: query.q, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true } },
          _count: { select: { comments: true, reactions: true } },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return { items, page, limit, total };
  }

  createPost(userId: string, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: { userId, body: dto.body },
      include: { user: { select: { id: true, email: true } } },
    });
  }

  listComments(postId: string, page = 1, limit = 10) {
    return this.prisma.comment.findMany({
      where: { postId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, email: true } } },
    });
  }

  createComment(userId: string, postId: string, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: { userId, postId, body: dto.body },
      include: { user: { select: { id: true, email: true } } },
    });
  }

  async react(userId: string, postId: string, type: string) {
    await this.prisma.reaction.upsert({
      where: { postId_userId_type: { postId, userId, type } },
      update: {},
      create: { postId, userId, type },
    });
    return this.prisma.reaction.groupBy({ by: ['type'], where: { postId }, _count: { _all: true } });
  }
}
