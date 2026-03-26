import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminApprovalAction } from './dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, institution: true },
    });
  }

  listPendingUsers() {
    return this.prisma.user.findMany({
      where: { status: AccountStatus.pending },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        institutionId: true,
        institution: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async reviewUser(userId: string, action: AdminApprovalAction) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!existing) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { status: action === AdminApprovalAction.approve ? AccountStatus.approved : AccountStatus.rejected },
      select: { id: true, email: true, status: true, role: true, institutionId: true, updatedAt: true },
    });
  }
}
