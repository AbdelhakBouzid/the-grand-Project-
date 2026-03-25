# EduWorld MVP (Phase 1)

Production-grade MVP monorepo for a global student-only social learning platform.

## Stack
- Monorepo with npm workspaces
- Frontend: Next.js + TypeScript + Tailwind
- Backend: NestJS + Prisma + PostgreSQL
- Auth: JWT + refresh token
- File storage abstraction: S3-compatible (MinIO local)
- Cache/Jobs foundation: Redis

## Monorepo structure
- `apps/api`: NestJS backend
- `apps/web`: Next.js frontend
- `docs/architecture.md`: architecture overview

## Setup
1. Copy env templates:
   - `cp .env.example .env`
   - `cp apps/api/.env.example apps/api/.env`
   - `cp apps/web/.env.example apps/web/.env.local`
2. Install dependencies:
   - `npm install`
3. Start infrastructure:
   - `docker compose up -d postgres redis minio`
4. Run DB setup:
   - `npm run db:generate`
   - `npm run db:migrate`
   - `npm run db:seed`
5. Start apps:
   - API: `npm run dev -w @eduworld/api`
   - Web: `npm run dev -w @eduworld/web`

## Docker full stack
- `docker compose up --build`

## API highlights (Phase 1)
- `POST /auth/signup`
- `POST /auth/login`
- `GET /users/me`
- `GET /institutions`
- `POST /institutions/requests`
- `POST /verification-requests` (multipart upload)
- `GET /verification-requests/mine`
- `GET /reviewer/verifications`
- `GET /reviewer/verifications/:id`
- `PATCH /reviewer/verifications/:id`

## Seed users
- Reviewer: `reviewer@eduworld.local` / `ChangeMe123!`
- Student: `student@eduworld.local` / `ChangeMe123!`

## Security defaults
- Argon2id password hashing
- JWT access/refresh split
- Role-based guards for reviewer/admin routes
- File type + size restrictions for verification docs
- Audit logs on review actions

## Tests
- `npm run test -w @eduworld/api`
- Includes signup, login, verification creation, and reviewer approval/rejection service tests.

## Phase 2 TODO (known)
- Full feed/groups/resources/exams API & frontend
- Institution admin workflows
- Async processing with Redis queues
- Stronger i18n framework and RTL runtime switching
- Reviewer UI data table and action forms
- Refresh token persistence/rotation and revoke lists
