# Backend Authentication Token Utility

## Overview

The `getBackendToken` utility provides a standardized way to generate JWT tokens for frontend-to-backend authentication. This replaces the previous ad-hoc token generation patterns used across different API routes.

## Usage

```typescript
import { getBackendToken } from '@/lib/backend-token';

export async function GET(request: NextRequest) {
  // Generate backend token using the shared utility
  const backendToken = await getBackendToken(request);
  if (!backendToken) {
    return NextResponse.json(
      { error: 'Failed to generate backend authentication token' },
      { status: 401 }
    );
  }

  // Use the token for backend API calls
  const response = await fetch(`${BACKEND_API_URL}/v1/some-endpoint`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${backendToken}`,
    },
  });
}
```

## Implementation Details

### Token Structure

The generated JWT token contains the following claims:

- `sub`: User ID (from NextAuth token's `sub` or `id` field)
- `email`: User's email address
- `isAdmin`: Whether the user has admin privileges (defaults to `false`)
- `exp`: Token expiration time (1 hour from generation)

### Security

- Tokens are signed with `NEXTAUTH_SECRET` environment variable
- Tokens expire after 1 hour to limit exposure
- Backend validates tokens by verifying signature and checking user existence in database

### Backend Integration

The backend `AuthGuard` has been updated to handle both:

1. **Backend-generated tokens**: Original session-based JWT tokens
2. **Frontend-generated tokens**: New NEXTAUTH_SECRET-signed tokens from this utility

The AuthGuard tries backend token validation first, then falls back to frontend token validation if needed.

## Routes Updated

The following API routes have been updated to use this utility:

- `/api/users/me` - User profile endpoint
- `/api/subscription/me` - User subscription details
- `/api/subscription/pay/initiate` - Payment initiation
- `/api/subscription/status` - Subscription status check

## Benefits

1. **Consistency**: All frontend-to-backend authentication uses the same token format
2. **Security**: Proper JWT signing with configurable expiration
3. **Maintainability**: Centralized token generation logic
4. **Flexibility**: Backend can handle both old and new token formats during migration

## Environment Variables

Ensure `NEXTAUTH_SECRET` is configured in your environment. This secret is used to sign the JWT tokens and must match between frontend and backend.

## Testing

Run the tests to verify the utility works correctly:

```bash
npm test lib/__tests__/backend-token.test.ts
```
