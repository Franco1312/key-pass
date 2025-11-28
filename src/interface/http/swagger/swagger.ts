import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Key Pass Auth Service API',
      version: '1.0.0',
      description: 'Production-ready authentication service with Clean Architecture',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'password123',
            },
          },
        },
        RegisterResponse: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                email: { type: 'string', format: 'email' },
                role: { type: 'string', enum: ['USER', 'ADMIN'] },
                plan: { type: 'string', example: 'FREE' },
                isEmailVerified: { type: 'boolean' },
              },
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              example: 'password123',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                email: { type: 'string', format: 'email' },
                role: { type: 'string', enum: ['USER', 'ADMIN'] },
                plan: { type: 'string' },
              },
            },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        RefreshTokenResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        LogoutRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
            revokeAll: { type: 'boolean', default: false },
          },
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
          },
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: { type: 'string' },
            newPassword: {
              type: 'string',
              minLength: 8,
              example: 'newpassword123',
            },
          },
        },
        VerifyEmailRequest: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string' },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
            plan: { type: 'string' },
            planExpiresAt: { type: 'string', format: 'date-time', nullable: true },
            isEmailVerified: { type: 'boolean' },
          },
        },
        UpgradePlanRequest: {
          type: 'object',
          required: ['planCode'],
          properties: {
            planCode: { type: 'string', example: 'PREMIUM' },
          },
        },
        DowngradePlanRequest: {
          type: 'object',
          required: ['planCode'],
          properties: {
            planCode: { type: 'string', example: 'FREE' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'Authentication endpoints' },
      { name: 'User', description: 'User management endpoints' },
    ],
  },
  apis: [
    './src/interface/http/routes/*.ts',
    './dist/interface/http/routes/*.js',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

