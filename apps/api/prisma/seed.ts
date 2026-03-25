import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('ChangeMe123!');

  await prisma.language.createMany({
    data: [
      { code: 'en', name: 'English', isRtl: false },
      { code: 'ar', name: 'Arabic', isRtl: true },
    ],
    skipDuplicates: true,
  });

  const institution = await prisma.institution.upsert({
    where: { id: 'demo-inst-1' },
    update: {},
    create: {
      id: 'demo-inst-1',
      name: 'Global Demo University',
      countryCode: 'US',
      city: 'New York',
      isPublic: true,
      isVerified: true,
    },
  });

  const reviewer = await prisma.user.upsert({
    where: { email: 'reviewer@eduworld.local' },
    update: {},
    create: {
      email: 'reviewer@eduworld.local',
      passwordHash,
      role: UserRole.reviewer,
      status: 'approved',
      institutionId: institution.id,
      profile: { create: { firstName: 'Review', lastName: 'Admin' } },
    },
  });

  await prisma.user.upsert({
    where: { email: 'student@eduworld.local' },
    update: {},
    create: {
      email: 'student@eduworld.local',
      passwordHash,
      role: UserRole.student,
      status: 'pending',
      institutionId: institution.id,
      profile: { create: { firstName: 'Demo', lastName: 'Student' } },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: reviewer.id,
      action: 'verification_reviewed',
      targetType: 'seed',
      targetId: 'initial',
      meta: { source: 'seed' },
    },
  });
}

main().finally(async () => prisma.$disconnect());
