import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const PRIVILEGED_ROLES = new Set<UserRole>([UserRole.reviewer, UserRole.moderator, UserRole.super_admin]);

@Injectable()
export class ApprovedAccountGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: { sub: string; role: UserRole } }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authenticated user required');
    }

    if (PRIVILEGED_ROLES.has(user.role)) {
      return true;
    }

    const account = await this.prisma.user.findUnique({ where: { id: user.sub }, select: { status: true } });
    if (!account || account.status !== 'approved') {
      throw new ForbiddenException('This section is available to approved accounts only');
    }

    return true;
  }
}
