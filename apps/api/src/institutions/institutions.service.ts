import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutionRequestDto } from './dto';

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.institution.findMany({ take: 100, orderBy: { name: 'asc' } });
  }

  createRequest(dto: CreateInstitutionRequestDto) {
    return this.prisma.institution.create({
      data: {
        name: dto.name,
        countryCode: dto.countryCode.toUpperCase(),
        city: dto.city,
        isPublic: dto.isPublic,
        isVerified: false,
      },
    });
  }
}
