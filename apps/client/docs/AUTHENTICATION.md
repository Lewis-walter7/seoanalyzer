# NextAuth-NestJS Authentication Integration

This document outlines the authentication integration between the Next.js frontend and NestJS backend using NextAuth JWT tokens.

## Overview

The authentication system uses NextAuth on the frontend to handle user authentication and generates JWT tokens that are forwarded to the NestJS backend for API authorization.

## Architecture

```
┌─────────────────┐    JWT Token    ┌─────────────────┐
│                 │ ──────────────► │                 │
│   Next.js       │                 │    NestJS       │
│   (NextAuth)    │                 │   (AuthGuard)   │
│                 │ ◄────────────── │                 │
└─────────────────┘   API Response  └─────────────────┘
```

## Implementation Details

### 1. NextAuth Configuration

**File: `lib/auth.ts`**

- Uses JWT strategy for sessions
- Includes user roles (`isAdmin`) in JWT payload
- Token expires in 24 hours
- Fetches user details from database during authentication

Key features:
- User roles are included in the JWT token
- Supports both Google OAuth and credentials providers
- Token contains: `sub`, `email`, `name`, `isAdmin`

### 2. JWT Token Forwarding

**File: `app/api/subscription/me/route.ts`**

The Next.js API routes forward authentication to the NestJS backend:

```typescript
// Get NextAuth JWT token
const token = await getToken({
  req: request,
  secret: process.env.NEXTAUTH_SECRET,
});

// Create backend token with user info
const backendToken = Buffer.from(JSON.stringify({
  sub: token.sub || token.id,
  email: token.email,
  name: token.name,
  isAdmin: token.isAdmin,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
})).toString('base64');

// Forward to backend with Authorization header
headers: {
  'Authorization': `Bearer ${backendToken}`,
}
```

### 3. NestJS Authentication Guard

**File: `../server/src/auth/auth.guard.ts`**

The NestJS backend validates JWT tokens using a custom AuthGuard:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract token from Authorization header
    const token = this.extractTokenFromHeader(request);
    
    // Validate NextAuth JWT token
    const payload = await this.validateNextAuthJWT(token);
    
    // Verify user exists in database
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub }
    });
    
    // Attach user to request
    request['user'] = user;
    return true;
  }
}
```

### 4. Role-Based Access Control

**Files: `../server/src/auth/admin.decorator.ts`, `../server/src/auth/admin.guard.ts`**

Controllers can require admin privileges:

```typescript
// Admin-only endpoint
@UseGuards(AuthGuard, AdminGuard)
@RequireAdmin()
@Get('admin/stats')
async getSubscriptionStats(@User() user: AuthenticatedUser) {
  // Only accessible by admin users
}
```

## Environment Variables

### Next.js Client (.env.local)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-shared-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_API_URL=http://localhost:3001
```

### NestJS Server (.env)
```env
NEXTAUTH_SECRET=your-shared-secret-key
JWT_SECRET=your-jwt-secret-key
PORT=3001
```

**Important:** The `NEXTAUTH_SECRET` must be the same in both applications for JWT validation to work.

## API Usage

### Client-Side (React Components)

```typescript
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

function MyComponent() {
  const { data: session } = useSession();
  
  // API calls automatically include authentication
  const subscription = await api.getSubscription();
}
```

### Server-Side (API Routes)

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Forward authenticated request to backend
}
```

### Backend (NestJS Controllers)

```typescript
@Controller('v1/example')
export class ExampleController {
  
  @Public() // Public endpoint
  @Get('public')
  async getPublicData() {
    return { data: 'public' };
  }
  
  @UseGuards(AuthGuard) // Requires authentication
  @Get('protected')
  async getProtectedData(@User() user: AuthenticatedUser) {
    return { data: 'protected', userId: user.id };
  }
  
  @UseGuards(AuthGuard, AdminGuard) // Requires admin role
  @RequireAdmin()
  @Get('admin')
  async getAdminData(@User() user: AuthenticatedUser) {
    return { data: 'admin-only', userId: user.id };
  }
}
```

## Security Features

1. **JWT Token Validation**: Backend validates JWT signature using shared secret
2. **Token Expiration**: Tokens expire in 24 hours
3. **Database Verification**: User existence verified on each request
4. **Role-Based Access**: Admin endpoints protected by role checks
5. **Public Endpoints**: Certain endpoints can bypass authentication

## Authentication Flow

1. User signs in via NextAuth (Google OAuth or credentials)
2. NextAuth creates JWT token with user information and roles
3. Client-side API calls include JWT in Authorization header
4. Next.js API routes forward JWT to NestJS backend
5. NestJS AuthGuard validates JWT and extracts user information
6. Protected endpoints receive authenticated user context
7. Role-based guards enforce admin-only access where needed

## Troubleshooting

### Common Issues

1. **Invalid or expired token**: Check `NEXTAUTH_SECRET` matches between apps
2. **User not found**: Ensure user exists in database
3. **Admin access denied**: Verify user has `isAdmin: true` in database
4. **Token not forwarded**: Check Authorization header in API requests

### Debug Tips

- Enable logging in AuthGuard to see token validation
- Check browser network tab for Authorization headers
- Verify JWT payload contains expected user information
- Ensure database connection is working in backend
