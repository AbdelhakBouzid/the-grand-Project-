import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateVerificationRequestDto } from './dto';
import { randomUUID } from 'crypto';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService, private readonly storage: StorageService) {}

  async create(userId: string, dto: CreateVerificationRequestDto, files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('At least one document is required');

    const request = await this.prisma.verificationRequest.create({
      data: {
        userId,
        institutionId: dto.institutionId,
        note: dto.note,
      },
    });

    for (const file of files) {
      const key = `verifications/${request.id}/${randomUUID()}-${file.originalname}`;
      const uploadResult = await this.storage.uploadBuffer(key, file.buffer, file.mimetype);

      await this.prisma.verificationDocument.create({
        data: {
          verificationRequestId: request.id,
          originalFilename: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          storageKey: uploadResult.key,
          checksumSha256: uploadResult.checksumSha256,
        },
      });
    }

    return this.prisma.verificationRequest.findUnique({
      where: { id: request.id },
      include: { documents: true },
    });
  }

  mine(userId: string) {
    return this.prisma.verificationRequest.findMany({ where: { userId }, include: { documents: true } });
  }
}
