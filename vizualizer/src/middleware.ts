import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow: login page, auth API, static assets, public interview routes
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/interview/') ||
    pathname === '/api/interview'
  ) {
    return NextResponse.next()
  }

  // Check for auth cookie
  const auth = request.cookies.get('site_auth')
  if (auth?.value === process.env.SITE_PASSWORD) {
    return NextResponse.next()
  }

  // Redirect to login
  const loginUrl = new URL('/login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  // Run on all routes except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|draft-images/).*)'],
}
