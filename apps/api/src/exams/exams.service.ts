import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto, ExamQueryDto } from './dto';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ExamQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const where = {
      ...(query.subject ? { subject: { contains: query.subject, mode: 'insensitive' as const } } : {}),
      ...(query.year ? { year: Number(query.year) } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.examSet.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { year: 'desc' } }),
      this.prisma.examSet.count({ where }),
    ]);

    return { items, page, limit, total };
  }

  create(dto: CreateExamDto) {
    return this.prisma.examSet.create({ data: { title: dto.title, subject: dto.subject, year: dto.year } });
  }
}
