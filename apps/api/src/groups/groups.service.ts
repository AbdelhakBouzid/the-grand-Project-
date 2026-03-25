import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto, GroupsQueryDto } from './dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: GroupsQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const where = query.q ? { name: { contains: query.q, mode: 'insensitive' as const } } : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.group.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { members: true } } },
      }),
      this.prisma.group.count({ where }),
    ]);

    return { items, page, limit, total };
  }

  create(ownerUserId: string, dto: CreateGroupDto) {
    return this.prisma.group.create({
      data: {
        name: dto.name,
        description: dto.description,
        isPrivate: dto.isPrivate ?? false,
        members: { create: { userId: ownerUserId, role: 'owner' } },
      },
      include: { members: true },
    });
  }

  async join(userId: string, groupId: string) {
    const existing = await this.prisma.groupMember.findFirst({ where: { userId, groupId } });
    if (existing) return existing;

    return this.prisma.groupMember.create({ data: { groupId, userId, role: 'member' } });
  }
}
