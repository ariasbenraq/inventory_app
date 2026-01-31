import { Body, Controller, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthenticatedRequest } from '../common/types';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const payload = await this.authService.login(body);
    this.setAuthCookie(response, payload.accessToken);
    return payload;
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const payload = await this.authService.register(body);
    this.setAuthCookie(response, payload.accessToken);
    return payload;
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() body: ChangePasswordDto,
  ): Promise<UserResponseDto> {
    return this.authService.changePassword(request.user?.userId ?? '', body);
  }

  private setAuthCookie(response: Response, accessToken: string): void {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 60 * 60 * 1000,
    });
  }
}
