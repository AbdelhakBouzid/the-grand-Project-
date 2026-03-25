import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountStatus, ReviewAction, VerificationStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewVerificationDto } from './dto';

@Injectable()
export class ReviewerService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  listPending() {
    return this.prisma.verificationRequest.findMany({
      where: { status: VerificationStatus.pending },
      include: { user: true, institution: true, documents: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  detail(id: string) {
    return this.prisma.verificationRequest.findUnique({
      where: { id },
      include: { user: true, institution: true, documents: true },
    });
  }

  async review(id: string, reviewerId: string, dto: ReviewVerificationDto) {
    const vr = await this.prisma.verificationRequest.findUnique({ where: { id } });
    if (!vr) throw new NotFoundException('Verification request not found');

    const status = dto.action === ReviewAction.approve
      ? VerificationStatus.approved
      : dto.action === ReviewAction.reject
        ? VerificationStatus.rejected
        : VerificationStatus.more_info_required;

    const updated = await this.prisma.verificationRequest.update({
      where: { id },
      data: {
        status,
        reviewerId,
        reviewedAt: new Date(),
        rejectionReason: dto.reason,
      },
    });

    if (dto.action === ReviewAction.approve || dto.action === ReviewAction.reject) {
      await this.prisma.user.update({
        where: { id: vr.userId },
        data: {
          status: dto.action === ReviewAction.approve ? AccountStatus.approved : AccountStatus.rejected,
        },
      });
    }

    await this.audit.log(reviewerId, 'verification_reviewed', 'verification_request', id, {
      action: dto.action,
      reason: dto.reason,
    });

    return updated;
  }
}
