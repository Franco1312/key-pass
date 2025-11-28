export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  plan: string;
}

export interface TokenService {
  signAccessToken(payload: TokenPayload): string;
  signRefreshToken(payload: TokenPayload): string;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
}

