import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma: any = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const jwt = new JwtService({ secret: 'test' });
  const service = new AuthService(prisma, jwt);

  it('signup creates user and returns tokens', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: 'u1', email: 'a@b.com', role: UserRole.student });
    const result = await service.signup({ email: 'a@b.com', password: 'StrongPass123!' });
    expect(result.accessToken).toBeDefined();
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('login returns tokens', async () => {
    const argon2 = await import('argon2');
    const hash = await argon2.hash('StrongPass123!');
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', role: UserRole.student, passwordHash: hash });
    const result = await service.login({ email: 'a@b.com', password: 'StrongPass123!' });
    expect(result.refreshToken).toBeDefined();
  });
});
