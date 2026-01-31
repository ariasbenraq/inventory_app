import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthenticatedRequest } from '../common/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('REQ_ADMIN')
  async createUser(@Body() body: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.createUser(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() request: AuthenticatedRequest): Promise<UserResponseDto> {
    return this.usersService.getUserById(request.user?.userId ?? '');
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('REQ_ADMIN')
  async getAll(): Promise<UserResponseDto[]> {
    return this.usersService.getAllUsers();
  }

  @Patch(':id/disable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('REQ_ADMIN')
  async disable(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.disableUser(id);
  }
}
