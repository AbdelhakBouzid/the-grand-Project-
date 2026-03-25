import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { PrismaModule } from './prisma/prisma.module';
import { VerificationModule } from './verification/verification.module';
import { ReviewerModule } from './reviewer/reviewer.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';
import { StorageModule } from './storage/storage.module';
import { FeedModule } from './feed/feed.module';
import { GroupsModule } from './groups/groups.module';
import { ResourcesModule } from './resources/resources.module';
import { ExamsModule } from './exams/exams.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ModerationModule } from './moderation/moderation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AuditModule,
    AuthModule,
    UsersModule,
    InstitutionsModule,
    VerificationModule,
    ReviewerModule,
    FeedModule,
    GroupsModule,
    ResourcesModule,
    ExamsModule,
    NotificationsModule,
    ModerationModule,
  ],
})
export class AppModule {}
