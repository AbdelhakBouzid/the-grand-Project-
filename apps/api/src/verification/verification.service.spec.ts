import { VerificationService } from './verification.service';

describe('VerificationService', () => {
  const prisma: any = {
    verificationRequest: { create: jest.fn(), findUnique: jest.fn() },
    verificationDocument: { create: jest.fn() },
  };
  const storage: any = { uploadBuffer: jest.fn() };
  const service = new VerificationService(prisma, storage);

  it('creates verification request with document', async () => {
    prisma.verificationRequest.create.mockResolvedValue({ id: 'vr1' });
    storage.uploadBuffer.mockResolvedValue({ key: 'k1', checksumSha256: 'sum' });
    prisma.verificationRequest.findUnique.mockResolvedValue({ id: 'vr1', documents: [{}] });
    const file: any = { originalname: 'id.pdf', mimetype: 'application/pdf', size: 100, buffer: Buffer.from('a') };
    const result = await service.create('u1', { institutionId: 'i1' }, [file]);
    expect(result.id).toBe('vr1');
  });
});
