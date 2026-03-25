import { ReviewAction } from '@prisma/client';
import { ReviewerService } from './reviewer.service';

describe('ReviewerService', () => {
  const prisma: any = {
    verificationRequest: { findUnique: jest.fn(), update: jest.fn() },
    user: { update: jest.fn() },
  };
  const audit: any = { log: jest.fn() };
  const service = new ReviewerService(prisma, audit);

  it('approves request and updates user status', async () => {
    prisma.verificationRequest.findUnique.mockResolvedValue({ id: 'vr1', userId: 'u1' });
    prisma.verificationRequest.update.mockResolvedValue({ id: 'vr1', status: 'approved' });
    const result = await service.review('vr1', 'reviewer1', { action: ReviewAction.approve });
    expect(result.status).toBe('approved');
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it('rejects request and updates user status', async () => {
    prisma.verificationRequest.findUnique.mockResolvedValue({ id: 'vr2', userId: 'u2' });
    prisma.verificationRequest.update.mockResolvedValue({ id: 'vr2', status: 'rejected' });
    const result = await service.review('vr2', 'reviewer1', { action: ReviewAction.reject, reason: 'invalid' });
    expect(result.status).toBe('rejected');
  });
});
