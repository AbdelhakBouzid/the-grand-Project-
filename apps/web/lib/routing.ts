import type { CurrentUser } from './api';

export function resolvePostAuthRoute(user: CurrentUser): string {
  if (user.role === 'super_admin' || user.role === 'reviewer') {
    return '/admin/reviews';
  }

  if (user.status === 'approved') {
    return '/feed';
  }

  if (user.status === 'pending') {
    return user.hasPendingInstitutionRequest ? '/pending-review' : '/onboarding';
  }

  return '/login';
}
