import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login({ username, password }: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: ['roles'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    const saved = await this.usersRepository.save(user);

    const token = await this.createToken(saved);

    return { accessToken: token, user: this.toUserResponse(saved) };
  }

  async register({ username, password }: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.usersRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists.');
    }

    const defaultRoleName =
      this.configService.get<string>('AUTH_DEFAULT_ROLE') ?? 'REQ_USER';
    const defaultRole = await this.rolesRepository.findOne({
      where: { name: defaultRoleName },
    });

    if (!defaultRole) {
      throw new BadRequestException('Default role is not configured.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      username,
      passwordHash,
      isActive: true,
      isTestUser: false,
      roles: [defaultRole],
    });

    const saved = await this.usersRepository.save(user);
    const token = await this.createToken(saved);

    return { accessToken: token, user: this.toUserResponse(saved) };
  }

  private async createToken(user: User): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      roles: user.roles?.map((role) => role.name) ?? [],
      isTestUser: user.isTestUser,
    });
  }

  private toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      isActive: user.isActive,
      isTestUser: user.isTestUser,
      roles: user.roles?.map((role) => role.name) ?? [],
      lastLoginAt: user.lastLoginAt ?? null,
    };
  }
}
