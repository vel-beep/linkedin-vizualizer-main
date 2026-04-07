import { getAllPosts } from '@/lib/posts'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const posts = getAllPosts()
  return NextResponse.json({ posts })
}
