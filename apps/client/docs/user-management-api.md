# User Management API Documentation

This document describes the user management endpoints implemented for the SEO Analyzer application.

## Overview

The user management system includes:
- User profile management (`/users/me`)
- Admin user management (`/admin/users`)
- Email verification system
- Registration with rate limiting
- Zod validation for all inputs
- Comprehensive error handling

## Authentication & Authorization

All endpoints use NextAuth.js for authentication. Admin endpoints require `isAdmin: true` flag on the user record.

### Rate Limiting

- **Registration**: 3 attempts per 15 minutes per IP
- **Login**: 5 attempts per 15 minutes per IP  
- **General API**: 100 requests per 15 minutes per IP
- **Admin API**: 200 requests per 15 minutes per IP

## Endpoints

### User Profile Management

#### GET /api/users/me
Get current user's profile information.

**Authentication**: Required  
**Rate Limit**: General API limits

**Response**:
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "emailVerified": "datetime|null",
    "image": "string|null",
    "isAdmin": "boolean",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "trialEndsAt": "datetime|null",
    "trialUsed": "boolean"
  },
  "subscription": {
    "plan": {
      "name": "string",
      "displayName": "string",
      "maxProjects": "number",
      "hasAdvancedReports": "boolean"
    }
  },
  "stats": {
    "projectCount": "number",
    "transactionCount": "number"
  }
}
```

#### PATCH /api/users/me
Update current user's profile.

**Authentication**: Required  
**Rate Limit**: General API limits

**Request Body**:
```json
{
  "name": "string (optional, 2-50 chars, letters and spaces only)",
  "email": "string (optional, valid email)",
  "image": "string (optional, valid URL)"
}
```

**Validation Rules**:
- Name: 2-50 characters, letters and spaces only
- Email: Valid email format, must be unique
- Image: Valid URL format

**Response**:
```json
{
  "message": "Profile updated successfully",
  "user": {
    // Updated user object
  }
}
```

### Admin User Management

#### GET /api/admin/users
List all users with pagination and filtering.

**Authentication**: Required (Admin only)  
**Rate Limit**: Admin API limits

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10, max: 100)
- `search`: Search by name or email
- `isAdmin`: Filter by admin status (`'true'` or `'false'`)
- `emailVerified`: Filter by email verification (`'true'` or `'false'`)
- `sortBy`: Sort field (`'name'`, `'email'`, `'createdAt'`, `'updatedAt'`)
- `sortOrder`: Sort direction (`'asc'` or `'desc'`)

**Response**:
```json
{
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "emailVerified": "datetime|null",
      "isAdmin": "boolean",
      "createdAt": "datetime",
      "_count": {
        "projects": "number",
        "subscriptions": "number",
        "transactions": "number"
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "totalCount": "number",
    "totalPages": "number",
    "hasNext": "boolean",
    "hasPrev": "boolean"
  }
}
```

#### POST /api/admin/users
Create a new user.

**Authentication**: Required (Admin only)  
**Rate Limit**: Admin API limits

**Request Body**:
```json
{
  "name": "string (required, 2-50 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, 8+ chars with complexity requirements)",
  "isAdmin": "boolean (optional, default: false)",
  "emailVerified": "datetime (optional)"
}
```

**Password Requirements**:
- At least 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character

**Response**:
```json
{
  "message": "User created successfully",
  "user": {
    // Created user object (without password)
  }
}
```

#### GET /api/admin/users/[id]
Get detailed information about a specific user.

**Authentication**: Required (Admin only)  
**Rate Limit**: Admin API limits

**Response**:
```json
{
  "user": {
    // Full user object with relationships
    "subscriptions": [...],
    "projects": [...],
    "transactions": [...]
  },
  "stats": {
    "projects": "number",
    "subscriptions": "number",
    "transactions": "number",
    "sessions": "number"
  }
}
```

#### PATCH /api/admin/users/[id]
Update a specific user.

**Authentication**: Required (Admin only)  
**Rate Limit**: Admin API limits

**Request Body** (all fields optional):
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "isAdmin": "boolean",
  "emailVerified": "datetime",
  "image": "string"
}
```

#### DELETE /api/admin/users/[id]
Delete a specific user.

**Authentication**: Required (Admin only)  
**Rate Limit**: Admin API limits

**Restrictions**:
- Cannot delete your own account
- Cannot delete users with active subscriptions or transactions

### Registration & Email Verification

#### POST /api/auth/register
Register a new user account with rate limiting.

**Rate Limit**: 3 registrations per 15 minutes per IP

**Request Body**:
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "confirmPassword": "string (required, must match password)"
}
```

**Response**:
```json
{
  "message": "Account created successfully!",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "emailVerified": null,
    "trialEndsAt": "datetime"
  },
  "emailVerificationSent": "boolean",
  "nextSteps": "string"
}
```

#### POST /api/auth/verify-email
Verify email address with token.

**Request Body**:
```json
{
  "token": "string (UUID)",
  "email": "string (email)"
}
```

**Response**:
```json
{
  "message": "Email verified successfully",
  "verified": true
}
```

#### PUT /api/auth/verify-email
Resend email verification.

**Request Body**:
```json
{
  "email": "string (email)"
}
```

**Response**:
```json
{
  "message": "Verification email sent successfully",
  "sent": true
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": [] // Validation errors (when applicable)
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden (admin required)
- `404`: Not Found
- `409`: Conflict (duplicate email)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Rate Limit Headers

All responses include rate limiting headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 2024-01-01T12:00:00.000Z
```

For rate-limited requests, additional header:
```
Retry-After: 900
```

## Email Verification System

The system uses the existing `Verification` table to manage email verification tokens:

- **Token Format**: UUID v4
- **Expiration**: 24 hours
- **Storage**: `identifier` field uses format `email_verification:{email}`
- **Cleanup**: Automatic cleanup of expired tokens

### Verification Email Template

Includes:
- Welcome message
- Verification button/link
- Trial information
- Fallback text link
- Expiration notice

## Security Features

1. **Password Hashing**: bcryptjs with salt rounds = 12
2. **Rate Limiting**: IP-based with configurable windows
3. **Input Validation**: Zod schemas for all inputs
4. **SQL Injection Protection**: Prisma ORM
5. **Email Enumeration Protection**: Consistent responses
6. **Admin Protection**: Cannot delete own account
7. **Token Cleanup**: Automatic expired token removal

## Implementation Notes

### Database Schema Compatibility

All endpoints work with the existing Prisma schema:
- Uses existing `User` model fields
- Leverages existing `Verification` table
- Compatible with subscription system
- Maintains referential integrity

### Future Enhancements

The implementation provides hooks for:
- Advanced email templates
- Multi-factor authentication
- Social login integration
- Advanced audit logging
- Redis-based rate limiting
- Email service provider integration

### Testing

Each endpoint should be tested for:
- Authentication requirements
- Input validation
- Rate limiting behavior
- Error handling
- Database constraints
- Email functionality (when applicable)
