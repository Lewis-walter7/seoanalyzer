
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import * as jwt from 'jsonwebtoken';

/**
 * Generates a JWT token for backend authentication.
 *
 * This token is signed with the NEXTAUTH_SECRET and contains essential user information.
 *
 * @param req The Next.js request object.
 * @returns A signed JWT token if the user is authenticated, otherwise null.
 */
export async function getBackendToken(req: NextRequest): Promise<string | null> {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return null;
  }

  const payload = {
    sub: token.sub || token.id,
    email: token.email,
    isAdmin: token.isAdmin || false,
  };

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '1h', // Token expires in 1 hour
  });
}

