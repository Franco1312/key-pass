export interface RegisterUserInput {
  email: string;
  password: string;
}

export interface RegisterUserOutput {
  user: {
    id: string;
    email: string;
    role: string;
    plan: string;
    isEmailVerified: boolean;
  };
}

export interface LoginUserInput {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface LoginUserOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    plan: string;
  };
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken?: string;
}

export interface LogoutInput {
  refreshToken: string;
  revokeAll?: boolean;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface SendVerificationEmailInput {
  userId: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface GetCurrentUserOutput {
  id: string;
  email: string;
  role: string;
  plan: string;
  planExpiresAt?: Date;
  isEmailVerified: boolean;
}

export interface UpgradePlanInput {
  userId: string;
  planCode: string;
}

export interface DowngradePlanInput {
  userId: string;
  planCode: string;
}

