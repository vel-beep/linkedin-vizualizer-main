import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

// Only serve files from within the repo root (one level up from vizualizer/)
const ALLOWED_BASE = path.resolve(process.cwd(), '..')

const MIME: Record<string, string> = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.avif': 'image/avif',
}

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get('file')
  if (!file) return new NextResponse('Missing file param', { status: 400 })

  const resolved = path.resolve(decodeURIComponent(file))

  // Security: block path traversal outside allowed directory
  if (!resolved.startsWith(ALLOWED_BASE)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  if (!existsSync(resolved)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const ext         = path.extname(resolved).toLowerCase()
  const contentType = MIME[ext] ?? 'application/octet-stream'
  const buffer      = readFileSync(resolved)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':  contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
