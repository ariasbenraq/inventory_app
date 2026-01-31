import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(@Body() body: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(body);
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async register(@Body() body: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(body);
  }
}
