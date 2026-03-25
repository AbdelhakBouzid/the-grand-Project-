import { GroupsService } from './groups.service';

describe('GroupsService', () => {
  const prisma: any = {
    $transaction: jest.fn(),
    group: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() },
    groupMember: { findFirst: jest.fn(), create: jest.fn() },
  };
  const service = new GroupsService(prisma);

  it('lists groups with search and pagination', async () => {
    prisma.$transaction.mockResolvedValueOnce([[{ id: 'g1', name: 'STEM' }], 1]);
    const result = await service.list({ q: 'st', page: 1, limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('avoids duplicate membership', async () => {
    prisma.groupMember.findFirst.mockResolvedValueOnce({ id: 'gm1' });
    const result = await service.join('u1', 'g1');
    expect(result.id).toBe('gm1');
    expect(prisma.groupMember.create).not.toHaveBeenCalled();
  });
});
