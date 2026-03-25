import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto, ResourceQueryDto } from './dto';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ResourceQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const where = query.q ? { title: { contains: query.q, mode: 'insensitive' as const } } : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.resource.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { files: true, owner: { select: { id: true, email: true } } },
        orderBy: { title: 'asc' },
      }),
      this.prisma.resource.count({ where }),
    ]);

    return { items, page, limit, total };
  }

  create(userId: string, dto: CreateResourceDto) {
    return this.prisma.resource.create({
      data: {
        title: dto.title,
        description: dto.description,
        ownerUserId: userId,
        files: { create: (dto.fileUrls ?? []).map((fileUrl) => ({ fileUrl })) },
      },
      include: { files: true },
    });
  }
}
