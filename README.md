# EduWorld MVP (Phase 2)

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

## API highlights (Phase 2)
- Auth + profile:
  - `POST /auth/signup`
  - `POST /auth/login`
  - `GET /users/me`
- Feed:
  - `GET /feed/posts?page=&limit=&q=`
  - `POST /feed/posts`
  - `GET /feed/posts/:postId/comments?page=&limit=`
  - `POST /feed/posts/:postId/comments`
  - `POST /feed/posts/:postId/reactions`
- Groups:
  - `GET /groups?page=&limit=&q=`
  - `POST /groups`
  - `POST /groups/:groupId/memberships`
- Resources and attachments:
  - `GET /resources?page=&limit=&q=`
  - `POST /resources`
- Exam archive:
  - `GET /exam-archive?page=&limit=&subject=&year=`
  - `POST /exam-archive` (teacher/institution_admin/super_admin)
- Notifications:
  - `GET /notifications?page=&limit=`
  - `PATCH /notifications/:id/read`
- Basic moderation reports:
  - `POST /moderation/reports`
  - `GET /moderation/reports` (moderator/reviewer/super_admin)

> Restricted sections (feed, groups, resources, exams, notifications, moderation) require authenticated users with approved accounts, except privileged roles (reviewer/moderator/super_admin).

## Seed users
- Reviewer: `reviewer@eduworld.local` / `ChangeMe123!`
- Student (approved): `student@eduworld.local` / `ChangeMe123!`

## Frontend pages (Phase 2)
- `/feed`
- `/groups`
- `/resources`
- `/exams`


## Production database migrations (Vercel + Neon)
- Prisma migrations are now committed under `apps/api/prisma/migrations`.
- For production/staging deploys, run **deploy migrations** (never `migrate dev`):
  - `npm run db:migrate:deploy` (repo root), or
  - `npm run prisma:migrate:deploy -w @eduworld/api`.
- Recommended Vercel backend Build Command:
  - `npm run build:vercel -w @eduworld/api`
  - This runs `prisma generate`, then `prisma migrate deploy`, then the Nest build.
- Required env vars on Vercel backend project:
  - `DATABASE_URL` (Neon connection string)
  - `DIRECT_URL` (optional but recommended for Prisma migrations/introspection if you use pooled URLs).

## Tests
- `npm run test -w @eduworld/api`
- Includes auth, verification/reviewer services, and new feed/groups service tests.

## Phase 3 (planned)
- Institution admin workflows and moderation action execution
- Rich media upload APIs with signed URLs + anti-virus scan queue
- Notification fan-out jobs and preference management
- Realtime updates (feed/group notifications)
- Advanced search/ranking and activity analytics
