import { AccountStatus, PrismaClient, UserRole } from '@prisma/client';
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
      status: AccountStatus.approved,
      institutionId: institution.id,
      profile: { create: { firstName: 'Review', lastName: 'Admin' } },
    },
  });

  const approvedStudent = await prisma.user.upsert({
    where: { email: 'student@eduworld.local' },
    update: { status: AccountStatus.approved },
    create: {
      email: 'student@eduworld.local',
      passwordHash,
      role: UserRole.student,
      status: AccountStatus.approved,
      institutionId: institution.id,
      profile: { create: { firstName: 'Demo', lastName: 'Student' } },
    },
  });

  const post = await prisma.post.create({
    data: {
      userId: approvedStudent.id,
      body: 'Welcome to the EduWorld Phase 2 feed!',
      comments: { create: { userId: reviewer.id, body: 'Great to see progress 🚀' } },
      reactions: { create: { userId: reviewer.id, type: 'like' } },
    },
  });

  const group = await prisma.group.create({
    data: {
      name: 'Global STEM Study Circle',
      description: 'Peer support for STEM courses and exam prep.',
      members: {
        create: [
          { userId: approvedStudent.id, role: 'owner' },
          { userId: reviewer.id, role: 'member' },
        ],
      },
    },
  });

  await prisma.resource.create({
    data: {
      title: 'Linear Algebra Notes',
      description: 'Week-by-week summary and solved examples.',
      ownerUserId: approvedStudent.id,
      files: {
        create: [
          { fileUrl: 'https://cdn.eduworld.local/resources/linear-algebra-notes.pdf' },
          { fileUrl: 'https://cdn.eduworld.local/resources/linear-algebra-problems.pdf' },
        ],
      },
    },
  });

  await prisma.examSet.createMany({
    data: [
      { title: 'Calculus Midterm Archive', subject: 'Mathematics', year: 2023 },
      { title: 'Physics Final Archive', subject: 'Physics', year: 2022 },
    ],
    skipDuplicates: true,
  });

  await prisma.notification.create({
    data: {
      userId: approvedStudent.id,
      type: 'system',
      title: 'Phase 2 demo data loaded',
      body: `Group ${group.name} and post ${post.id} are ready for exploration.`,
    },
  });

  await prisma.report.create({
    data: {
      reporterId: reviewer.id,
      targetType: 'post',
      targetId: post.id,
      reason: 'Demo moderation report for reviewer queue testing',
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: reviewer.id,
      action: 'verification_reviewed',
      targetType: 'seed',
      targetId: 'phase-2',
      meta: { source: 'seed' },
    },
  });
}

main().finally(async () => prisma.$disconnect());
