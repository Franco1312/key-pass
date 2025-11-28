# Key Pass - Auth Service

Production-ready authentication service built with Node.js, Express, and TypeScript following Clean Architecture principles.

## Features

- Classic email/password authentication
- JWT access tokens + refresh tokens
- Role-based access control (USER, ADMIN)
- Subscription plans (FREE, PREMIUM, etc.)
- Email verification
- Password reset flow
- Clean Architecture with SOLID principles

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: PostgreSQL (via `pg` driver)
- **Security**: JWT (`jsonwebtoken`), bcrypt (`bcryptjs`)
- **Validation**: Zod
- **Environment**: dotenv

## Project Structure

```
src/
├── domain/              # Domain layer (entities, repository interfaces)
│   ├── entities/
│   └── repositories/
├── application/         # Application layer (use cases, DTOs)
│   ├── dto/
│   └── use-cases/
├── infrastructure/      # Infrastructure layer (DB, security, config)
│   ├── db/
│   ├── repositories/
│   ├── security/
│   ├── mail/
│   └── config/
└── interface/          # HTTP layer (Express)
    └── http/
        ├── controllers/
        ├── routes/
        ├── middlewares/
        └── server.ts
```

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file based on `.env.example`:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL=postgres://user:pass@host:port/db
   JWT_ACCESS_TOKEN_SECRET=your_strong_secret_key_here
   JWT_REFRESH_TOKEN_SECRET=your_another_strong_secret_key_here
   JWT_ACCESS_TOKEN_EXPIRES_IN=15m
   JWT_REFRESH_TOKEN_EXPIRES_IN=30d
   ```

3. **Run database migrations**:
   ```bash
   npm run migrate:up
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (revoke refresh token)
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/send-verification-email` - Send email verification (requires auth)
- `POST /auth/verify-email` - Verify email with token

### User

- `GET /me` - Get current user info (requires auth)
- `POST /me/upgrade-plan` - Upgrade subscription plan (requires auth)
- `POST /me/downgrade-plan` - Downgrade subscription plan (requires auth)

## Architecture

The project follows Clean Architecture with clear separation of concerns:

- **Domain Layer**: Pure business logic, no dependencies on frameworks or infrastructure
- **Application Layer**: Use cases orchestrate domain entities and repositories
- **Infrastructure Layer**: Concrete implementations (PostgreSQL, JWT, bcrypt)
- **Interface Layer**: HTTP/Express-specific code (controllers, routes, middlewares)

## Security

- Passwords are hashed using bcrypt
- Access tokens are short-lived JWTs (default: 15 minutes)
- Refresh tokens are opaque UUIDs stored in database (default: 30 days)
- Token rotation on refresh for enhanced security
- Role and plan-based access control via middlewares

## Database Schema

The service uses PostgreSQL with the following main tables:
- `users` - User accounts
- `refresh_tokens` - Refresh token storage
- `password_reset_tokens` - Password reset flow
- `email_verification_tokens` - Email verification
- `subscription_plans` - Available plans
- `user_subscriptions` - User subscription history

See `src/infrastructure/db/migrations/001_initial_schema.sql` for the complete schema.

## License

ISC
