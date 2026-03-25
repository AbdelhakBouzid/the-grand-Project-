import { FeedService } from './feed.service';

describe('FeedService', () => {
  const prisma: any = {
    $transaction: jest.fn(),
    post: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() },
    comment: { findMany: jest.fn(), create: jest.fn() },
    reaction: { upsert: jest.fn(), groupBy: jest.fn() },
  };
  const service = new FeedService(prisma);

  it('lists paginated posts', async () => {
    prisma.$transaction.mockResolvedValueOnce([[{ id: 'p1' }], 1]);
    const result = await service.listPosts({ page: 2, limit: 5, q: 'math' });
    expect(result.page).toBe(2);
    expect(result.total).toBe(1);
  });

  it('reacts and returns grouped counts', async () => {
    prisma.reaction.groupBy.mockResolvedValueOnce([{ type: 'like', _count: { _all: 1 } }]);
    const result = await service.react('u1', 'p1', 'like');
    expect(prisma.reaction.upsert).toHaveBeenCalled();
    expect(result[0].type).toBe('like');
  });
});
