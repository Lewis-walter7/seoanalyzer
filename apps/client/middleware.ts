import { NextResponse, NextRequest } from 'next/server';
import { getJWTToken } from './lib/jwt';

export function middleware(request: NextRequest) {
  const token = getJWTToken(request);
  const { pathname } = request.nextUrl;
  
  // Define protected routes
  const protectedRoutes = ['/dashboard', '/features'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If user is authenticated and trying to access login/signup, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Specify which routes should be protected by this middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/features/:path*"
  ]
};
