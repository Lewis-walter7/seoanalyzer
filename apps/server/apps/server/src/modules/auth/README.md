# Auth Module

This module provides authentication functionality including JWT-based authentication, password hashing with bcrypt, and Google OAuth integration.

## Features

- User registration and login with email/password
- JWT token generation and validation
- Password hashing with bcrypt (12 rounds)
- Google OAuth integration using Passport.js
- Express and Fastify middleware support
- TypeScript support with proper type definitions

## Environment Variables

Make sure to set the following environment variables:

```bash
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Usage

### Express Setup

```typescript
import express from 'express';
import { authRouter, authenticateJWT } from './modules/auth';

const app = express();

// Use auth routes
app.use('/auth', authRouter);

// Protect routes with authentication
app.get('/protected', authenticateJWT, (req, res) => {
  res.json({ user: req.user });
});
```

### Fastify Setup

```typescript
import Fastify from 'fastify';
import { fastifyAuthenticateJWT } from './modules/auth';

const fastify = Fastify();

// Protect routes with authentication
fastify.get('/protected', {
  preHandler: fastifyAuthenticateJWT
}, async (request, reply) => {
  return { user: request.user };
});
```

## API Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Logged in successfully",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

### POST /auth/logout
Logout the current user (requires authentication).

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### GET /auth/session
Get current user session (requires authentication).

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "message": "Session is valid",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

## Google OAuth

The module includes Google OAuth support using Passport.js. To enable it:

1. Set up a Google OAuth application in the Google Cloud Console
2. Set the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables
3. Configure the callback URL to `http://your-domain/auth/google/callback`

## Database Integration

The auth service includes placeholder methods for database operations:

- `findUserByEmail(email: string)`
- `saveUser(user: User)`
- `updateUser(user: User)`
- `findUserById(userId: string)`

You need to implement these methods with your chosen database solution (e.g., PostgreSQL, MongoDB, etc.).

## Security Features

- Passwords are hashed with bcrypt using 12 rounds
- JWT tokens expire after 24 hours
- Sensitive user data (passwords) are excluded from API responses
- Proper error handling for authentication failures

## Middleware Options

- `authenticateJWT`: Requires valid JWT token
- `optionalAuthenticateJWT`: Attaches user if token is valid, but doesn't require it
- `requireAuth`: Use after `authenticateJWT` to ensure user is attached
- `fastifyAuthenticateJWT`: Fastify version of JWT authentication
- `fastifyOptionalAuthenticateJWT`: Fastify version of optional authentication

## Type Guards

- `isAuthenticated(req)`: Check if Express request has authenticated user
- `isFastifyAuthenticated(req)`: Check if Fastify request has authenticated user
