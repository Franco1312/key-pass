export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  userAgent?: string;
  ipAddress?: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}

