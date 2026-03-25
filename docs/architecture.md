# EduWorld Architecture (Phase 2)

## System overview
EduWorld uses a monorepo with:
- `apps/web`: Next.js app-router frontend (phase pages for feed/groups/resources/exams).
- `apps/api`: NestJS API-first backend with RBAC + account-status restrictions.
- PostgreSQL for source of truth via Prisma.
- Redis reserved for cache/jobs.
- S3-compatible object storage for verification documents and future resource uploads.

## Auth + access model
1. User signs up with email/password via `POST /auth/signup`.
2. Password stored using Argon2id.
3. API issues short-lived access token + longer refresh token.
4. JWT auth guard protects private routes.
5. `ApprovedAccountGuard` gates community sections to approved users while still allowing privileged trust/safety roles:
   - reviewer
   - moderator
   - super_admin
6. `RolesGuard` continues to enforce role-specific operations.

## Phase 2 domain modules

### Feed, comments, reactions
- `FeedModule` exposes `/feed` routes.
- Post listing supports pagination and keyword search (`q`).
- Comment listing supports pagination.
- Reaction endpoint upserts user reaction and returns grouped totals by type.

### Groups + membership
- `GroupsModule` exposes `/groups` routes.
- Group listing supports pagination and name search.
- Membership endpoint creates membership idempotently.

### Educational resources + file attachments
- `ResourcesModule` exposes `/resources` routes.
- Resource listing supports pagination and title search.
- Resource create endpoint accepts attached file URLs (`fileUrls`) and stores in `resource_files`.

### Exam archive resources
- `ExamsModule` exposes `/exam-archive` routes.
- Supports pagination with `subject`/`year` filters.
- Create operation restricted to teacher/institution_admin/super_admin.

### Notifications
- `NotificationsModule` exposes `/notifications`.
- Users fetch paginated personal notifications and mark items as read.

### Basic moderation reports
- `ModerationModule` exposes `/moderation/reports`.
- Approved users can file reports against targets.
- Moderators/reviewers/super-admin can list report queue.

## Data consistency and API conventions
- Route naming follows existing resource-oriented style.
- Pagination pattern (`page`, `limit`) is applied across Phase 2 lists.
- Search filters are optional and scoped by domain (`q`, `subject`, `year`).
- New modules reuse existing Prisma models and RBAC decorators/guards.

## Phase 3 boundary
Phase 2 intentionally stops at basic CRUD/listing workflows. Remaining Phase 3 work:
- moderation action workflows (enforcement decisions, escalation tracking)
- asynchronous media handling and scanning pipelines
- websocket/realtime feed + notifications
- richer admin dashboards and institution governance tooling
- recommendation/ranking and personalization layers
