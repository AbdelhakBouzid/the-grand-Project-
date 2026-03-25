import { AuditAction } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(actorUserId: string, action: AuditAction, targetType: string, targetId: string, meta?: Record<string, unknown>) {
    return this.prisma.auditLog.create({
      data: { actorUserId, action, targetType, targetId, meta },
    });
  }
}
