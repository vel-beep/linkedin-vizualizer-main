import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('site_auth', '', { maxAge: 0, path: '/' })
  res.cookies.set('site_user', '', { maxAge: 0, path: '/' })
  return res
}
