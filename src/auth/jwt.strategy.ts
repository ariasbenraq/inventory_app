import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../common/types';

interface JwtPayload {
  sub: string;
  roles: string[];
  isTestUser: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request) => {
          const cookies = parseCookieHeader(request?.headers?.cookie);
          return cookies.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      userId: payload.sub,
      roles: payload.roles,
      isTestUser: payload.isTestUser,
    };
  }
}

function parseCookieHeader(headerValue?: string): Record<string, string> {
  if (!headerValue) {
    return {};
  }

  return headerValue.split(';').reduce<Record<string, string>>((cookies, cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    if (!name) {
      return cookies;
    }
    cookies[name] = decodeURIComponent(rest.join('='));
    return cookies;
  }, {});
}
