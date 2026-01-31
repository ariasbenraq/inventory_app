import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly configService: ConfigService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const environment = this.configService.get<string>('NODE_ENV');
    if (dto.isTestUser && environment === 'production') {
      throw new BadRequestException('Test users are not allowed in production.');
    }

    const roles = await this.rolesRepository.find({
      where: { id: In(dto.roleIds) },
    });

    if (roles.length !== dto.roleIds.length) {
      throw new BadRequestException('Invalid role assignment.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      username: dto.username,
      passwordHash,
      isTestUser: dto.isTestUser ?? false,
      isActive: true,
      roles,
    });

    const saved = await this.usersRepository.save(user);
    return this.toResponse(saved);
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponse(user);
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({ relations: ['roles'] });
    return users.map((user) => this.toResponse(user));
  }

  async disableUser(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = false;
    const saved = await this.usersRepository.save(user);
    return this.toResponse(saved);
  }

  private toResponse(user: User): UserResponseDto {
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
