import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { Role } from '../roles/role.entity';
import { User } from '../users/user.entity';

describe('AuthService.changePassword', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    usersRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    const rolesRepository = {} as Repository<Role>;
    const jwtService = {} as JwtService;
    const configService = {} as ConfigService;

    service = new AuthService(usersRepository, rolesRepository, jwtService, configService);
  });

  it('updates the password when the current password matches', async () => {
    const passwordHash = await bcrypt.hash('OldPass123', 10);
    const user = {
      id: 'user-1',
      username: 'user-1',
      passwordHash,
      roles: [],
      isActive: true,
      isTestUser: false,
      lastLoginAt: null,
    } as User;

    usersRepository.findOne.mockResolvedValue(user);
    usersRepository.save.mockImplementation(async (savedUser) => savedUser as User);

    const response = await service.changePassword('user-1', {
      currentPassword: 'OldPass123',
      newPassword: 'NewPass123',
    });

    expect(usersRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = usersRepository.save.mock.calls[0][0] as User;
    expect(savedUser.passwordHash).not.toBe(passwordHash);
    expect(response.id).toBe('user-1');
  });

  it('throws when the current password is invalid', async () => {
    const passwordHash = await bcrypt.hash('OldPass123', 10);
    const user = {
      id: 'user-1',
      username: 'user-1',
      passwordHash,
      roles: [],
      isActive: true,
      isTestUser: false,
      lastLoginAt: null,
    } as User;

    usersRepository.findOne.mockResolvedValue(user);

    await expect(
      service.changePassword('user-1', {
        currentPassword: 'WrongPass123',
        newPassword: 'NewPass123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws when the user does not exist', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(
      service.changePassword('missing-user', {
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
