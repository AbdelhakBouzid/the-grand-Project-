import { Injectable, NotFoundException } from '@nestjs/common';
import { InstitutionRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutionRequestDto, InstitutionApprovalAction } from './dto';

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.institution.findMany({ take: 100, orderBy: { name: 'asc' } });
  }

  createRequest(userId: string, dto: CreateInstitutionRequestDto) {
    return this.prisma.institutionRequest.create({
      data: {
        requesterUserId: userId,
        name: dto.name,
        countryCode: dto.countryCode.toUpperCase(),
        city: dto.city,
        isPublic: dto.isPublic,
      },
      select: {
        id: true,
        name: true,
        countryCode: true,
        city: true,
        isPublic: true,
        status: true,
        createdAt: true,
      },
    });
  }

  listPendingRequests() {
    return this.prisma.institutionRequest.findMany({
      where: { status: InstitutionRequestStatus.pending },
      orderBy: { createdAt: 'asc' },
      include: {
        requester: {
          select: { id: true, email: true, status: true, role: true },
        },
      },
    });
  }

  async reviewRequest(requestId: string, reviewerId: string, action: InstitutionApprovalAction, reason?: string) {
    const request = await this.prisma.institutionRequest.findUnique({
      where: { id: requestId },
      include: { requester: { select: { id: true } } },
    });
    if (!request) throw new NotFoundException('Institution request not found');

    if (action === InstitutionApprovalAction.reject) {
      return this.prisma.institutionRequest.update({
        where: { id: requestId },
        data: {
          status: InstitutionRequestStatus.rejected,
          reviewedByUserId: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: reason,
        },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const institution = await tx.institution.create({
        data: {
          name: request.name,
          countryCode: request.countryCode,
          city: request.city,
          isPublic: request.isPublic,
          isVerified: true,
        },
      });

      await tx.user.update({
        where: { id: request.requester.id },
        data: { institutionId: institution.id },
      });

      return tx.institutionRequest.update({
        where: { id: requestId },
        data: {
          status: InstitutionRequestStatus.approved,
          reviewedByUserId: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: null,
          institutionId: institution.id,
        },
        include: { institution: true },
      });
    });
  }
}
