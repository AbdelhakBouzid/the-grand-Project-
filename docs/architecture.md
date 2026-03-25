# EduWorld Architecture (Phase 1)

## System overview
EduWorld uses a monorepo with:
- `apps/web`: Next.js app-router frontend (i18n-ready, RTL/LTR-ready HTML attrs).
- `apps/api`: NestJS API-first backend.
- PostgreSQL for source of truth via Prisma.
- Redis reserved for cache/jobs.
- S3-compatible object storage for verification documents.

## Auth flow
1. User signs up with email/password via `POST /auth/signup`.
2. Password stored using Argon2id.
3. API issues short-lived access token + longer refresh token.
4. Access token is used in `Authorization: Bearer` for protected APIs.
5. User account starts in `pending` status until verification review.

## Verification workflow
1. User selects institution or submits institution request.
2. User submits verification request with one or more documents.
3. Files are validated (MIME + size), then uploaded to object storage.
4. Verification request remains `pending`.
5. Reviewer accesses dashboard endpoints, reviews, and sets action:
   - approve
   - reject
   - request_more_info
6. Approve/reject updates user account status and records audit log.

## File storage strategy
- `StorageService` abstracts object store interactions.
- Current implementation uploads to S3-compatible bucket (MinIO in local dev).
- Document metadata and checksum are persisted in `verification_documents`.
- Access logs table exists (`document_access_logs`) for future sensitive access auditing.

## Roles and permissions
Roles:
- student
- teacher
- institution_admin
- reviewer
- moderator
- super_admin

RBAC:
- JWT auth guard for protected routes.
- `@Roles` decorator + `RolesGuard` for privileged reviewer endpoints.
- Reviewer endpoints restricted to `reviewer` and `super_admin`.

## Future scaling notes
- Add queue-backed antivirus/scanning and OCR prechecks for docs.
- Partition hot tables (posts, notifications, audit logs).
- Add read replicas and caching layers.
- Add CDN + signed URLs for object access.
- Add tenant-like institution-level policy packs.
- Expand i18n to runtime locale negotiation and translated content fields.
