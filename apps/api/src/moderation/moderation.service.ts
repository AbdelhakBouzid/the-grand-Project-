import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  createReport(reporterId: string, dto: CreateReportDto) {
    return this.prisma.report.create({ data: { reporterId, ...dto } });
  }

  listReports(page = 1, limit = 20) {
    return this.prisma.report.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { reporter: { select: { id: true, email: true } } },
    });
  }
}
