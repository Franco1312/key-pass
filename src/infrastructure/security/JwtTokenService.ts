import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '@infrastructure/config/env';
import { TokenService, TokenPayload } from '@infrastructure/security/TokenService';

export class JwtTokenService implements TokenService {
  signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: config.JWT_ACCESS_TOKEN_EXPIRES_IN,
    } as SignOptions);
  }

  signRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: config.JWT_REFRESH_TOKEN_EXPIRES_IN,
    } as SignOptions);
  }

  verifyAccessToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, config.JWT_ACCESS_TOKEN_SECRET) as TokenPayload;
    return decoded;
  }

  verifyRefreshToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, config.JWT_REFRESH_TOKEN_SECRET) as TokenPayload;
    return decoded;
  }
}

